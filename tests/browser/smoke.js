'use strict';

/**
 * Browser test, run inside the DCI wiki container via `make browser-test`.
 *
 * The QUnit tests load the target classes without VisualEditor, and the PHPUnit tests never run
 * JavaScript. This script covers what falls between them in a real Chromium on a live wiki: a
 * Page Forms form with a VisualEditor textarea starts a real editor, the toolbar offers the
 * switch to the wikitext editor, with and without the class toolbarOnTop, and the editors of a
 * multiple-instance template work and save their content.
 *
 * Every check is a concrete assertion with a failure message and a non-zero exit code.
 */

const { chromium } = require( 'playwright' );
const { execFileSync } = require( 'child_process' );

const BASE_URL = 'http://127.0.0.1:8080';
const MW_DIR = '/var/www/html';
const SWITCH_TOOL = '.oo-ui-tool-name-ve4aSwitchEditor';
const FAILURES = [];

function check( condition, message ) {
	if ( !condition ) {
		FAILURES.push( message );
		console.error( `FAIL: ${ message }` );
	} else {
		console.log( `ok:   ${ message }` );
	}
}

function mwRun( args, input ) {
	return execFileSync( 'php', [ 'maintenance/run.php', ...args ], { cwd: MW_DIR, input } );
}

/**
 * Creates or updates a page and invalidates its parser cache entry, so that a repeated run starts
 * from the same state.
 *
 * @param {string} title
 * @param {string} wikitext
 */
function createPage( title, wikitext ) {
	mwRun( [ 'edit', '--user', 'WikiSysop', '--summary', 'browser test', title ], wikitext );
	mwRun( [ 'purgePage' ], `${ title }\n` );
}

function formDefinition( textareaArguments ) {
	return '<includeonly>\n' +
		'{{{for template|VEForAllSmoke}}}\n' +
		`{{{field|text|input type=textarea|editor=visualeditor${ textareaArguments }}}}\n` +
		'{{{end template}}}\n' +
		'{{{standard input|save}}}\n' +
		'</includeonly>';
}

const VARIANTS = [
	{ name: 'normal toolbar', form: 'VEForAllSmokeNormal', textareaArguments: '' },
	{ name: 'toolbarOnTop', form: 'VEForAllSmokeTop', textareaArguments: '|class=toolbarOnTop' }
];

async function checkVariant( browser, variant ) {
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', ( error ) => errors.push( error.message ) );

	await page.goto( `${ BASE_URL }/index.php?title=Special:FormEdit/${ variant.form }/Smoke_${ variant.form }` );

	// The editor is ready as soon as VisualEditor has built the toolbar with its regular tools.
	await page.waitForSelector( '.ve-area-wrapper .oo-ui-tool-name-bold', {
		state: 'attached', timeout: 90000
	} );

	check(
		await page.locator( SWITCH_TOOL ).count() === 1,
		`${ variant.name }: the toolbar has the switch to the wikitext editor`
	);
	check( errors.length === 0, `${ variant.name }: no JavaScript error on the page ${ errors.join( ' | ' ) }` );

	await page.close();
}

const INSTANCE_TEXTAREAS = '.multipleTemplateInstance:not(.multipleTemplateStarter) textarea.visualeditor';

/**
 * Waits until the given number of editors of a form are ready. The textarea of an editor is
 * hidden in the same moment as its toolbar and its document appear, so that is the signal.
 *
 * @param {Object} page
 * @param {number} count
 */
async function waitForEditors( page, count ) {
	await page.waitForFunction( ( [ selector, expected ] ) => {
		const textareas = [ ...document.querySelectorAll( selector ) ];
		return textareas.length === expected && textareas.every( ( t ) => t.style.display === 'none' );
	}, [ INSTANCE_TEXTAREAS, count ], { timeout: 90000 } );
}

/**
 * Types into the editor of an instance. VisualEditor needs a moment after the click before it takes
 * keystrokes; VEForAll marks the field as changed when the editor got the focus, so wait for that.
 *
 * @param {Object} page
 * @param {number} index
 * @param {string} text
 */
async function typeIntoEditor( page, index, text ) {
	await page.locator( '.multipleTemplateInstance:not(.multipleTemplateStarter) .ve-ce-documentNode' )
		.nth( index ).click( { position: { x: 100, y: 20 } } );
	await page.waitForFunction(
		( [ selector, i ] ) => [ ...document.querySelectorAll( selector ) ][ i ]
			.classList.contains( 've-for-all-waiting-for-update' ),
		[ INSTANCE_TEXTAREAS, index ]
	);
	await page.keyboard.type( text );
	await page.waitForFunction(
		( [ i, expected ] ) => $.fn.getVEInstances()[ i ].target.getSurface().getModel()
			.getDocument().data.getText() === expected,
		[ index, text ],
		{ timeout: 10000 }
	);
}

async function checkMultipleInstances( browser ) {
	const title = `Smoke_Multiple_${ Date.now() }`;
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', ( error ) => errors.push( error.message ) );

	await page.goto( `${ BASE_URL }/index.php?title=Special:FormEdit/VEForAllSmokeMultiple/${ title }` );
	await waitForEditors( page, 1 );

	check(
		await page.evaluate( () => $.fn.getVEInstances().length ) === 1,
		'multiple instances: the form starts with one editor, the hidden starter has none'
	);
	check(
		await page.locator( SWITCH_TOOL ).count() === 1,
		'multiple instances: the first editor has the switch to the wikitext editor'
	);

	await page.locator( '.multipleTemplateAdder' ).click();
	await waitForEditors( page, 2 );

	check(
		await page.evaluate( () => $.fn.getVEInstances().length ) === 2,
		'multiple instances: an added instance gets its own editor'
	);
	check(
		await page.locator( SWITCH_TOOL ).count() === 2,
		'multiple instances: the added editor has the switch to the wikitext editor'
	);

	await typeIntoEditor( page, 0, 'first' );
	await typeIntoEditor( page, 1, 'second' );

	await page.locator( '#wpSave' ).click();
	// The form URL contains the title too, so wait until the saved page is shown.
	await page.waitForURL(
		( url ) => url.href.includes( title ) && !url.href.includes( 'Special:FormEdit' ),
		{ timeout: 30000 }
	).catch( async () => {
		const messages = await page.locator( '.cdx-message, .errorbox, .error' ).allTextContents();
		check( false, `multiple instances: the form was not saved ${ messages.join( ' | ' ).trim() }` );
	} );

	const saved = await ( await page.request.get( `${ BASE_URL }/index.php?title=${ title }&action=raw` ) ).text();
	check(
		/\{\{VEForAllSmokeMultiple\s*\|text=first\s*\}\}\s*\{\{VEForAllSmokeMultiple\s*\|text=second\s*\}\}/
			.test( saved ),
		`multiple instances: both texts are saved, each in its own template call ${ JSON.stringify( saved ) }`
	);
	check( errors.length === 0, `multiple instances: no JavaScript error on the page ${ errors.join( ' | ' ) }` );

	await page.close();
}

async function checkRemovedInstance( browser ) {
	const title = `Smoke_Removed_${ Date.now() }`;
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', ( error ) => errors.push( error.message ) );

	await page.goto( `${ BASE_URL }/index.php?title=Special:FormEdit/VEForAllSmokeMultiple/${ title }` );
	await waitForEditors( page, 1 );
	await page.locator( '.multipleTemplateAdder' ).click();
	await waitForEditors( page, 2 );
	await typeIntoEditor( page, 0, 'removed' );
	await typeIntoEditor( page, 1, 'kept' );

	await page.locator( '.multipleTemplateInstance:not(.multipleTemplateStarter) a.removeButton' )
		.first().click();
	await page.locator( '.multipleTemplateInstance:not(.multipleTemplateStarter)' ).nth( 1 )
		.waitFor( { state: 'detached' } );

	await page.locator( '#wpSave' ).click();
	await page.waitForURL(
		( url ) => url.href.includes( title ) && !url.href.includes( 'Special:FormEdit' ),
		{ timeout: 30000 }
	).catch( async () => {
		const messages = await page.locator( '.cdx-message, .errorbox, .error' ).allTextContents();
		check( false, `removed instance: the form was not saved ${ messages.join( ' | ' ).trim() }` );
	} );

	const saved = await ( await page.request.get( `${ BASE_URL }/index.php?title=${ title }&action=raw` ) ).text();
	check(
		/^\{\{VEForAllSmokeMultiple\s*\|text=kept\s*\}\}$/.test( saved ),
		`removed instance: only the remaining entry is saved ${ JSON.stringify( saved ) }`
	);
	check( errors.length === 0, `removed instance: no JavaScript error on the page ${ errors.join( ' | ' ) }` );

	await page.close();
}

( async () => {
	createPage( 'Template:VEForAllSmoke', '<includeonly>{{{text|}}}</includeonly>' );
	for ( const variant of VARIANTS ) {
		createPage( `Form:${ variant.form }`, formDefinition( variant.textareaArguments ) );
	}

	createPage( 'Template:VEForAllSmokeMultiple', '<includeonly>{{{text|}}}</includeonly>' );
	createPage( 'Form:VEForAllSmokeMultiple', '<includeonly>\n' +
		'{{{for template|VEForAllSmokeMultiple|multiple|minimum instances=1}}}\n' +
		'{{{field|text|input type=textarea|editor=visualeditor|class=toolbarOnTop}}}\n' +
		'{{{end template}}}\n' +
		'{{{standard input|save}}}\n' +
		'</includeonly>' );

	const browser = await chromium.launch();
	try {
		for ( const variant of VARIANTS ) {
			await checkVariant( browser, variant );
		}
		await checkMultipleInstances( browser );
		await checkRemovedInstance( browser );
	} finally {
		await browser.close();
	}

	if ( FAILURES.length ) {
		console.error( `${ FAILURES.length } check(s) failed` );
		process.exit( 1 );
	}
} )().catch( ( error ) => {
	console.error( error );
	process.exit( 1 );
} );
