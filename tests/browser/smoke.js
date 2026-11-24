'use strict';

/**
 * Browser test, run inside the DCI wiki container via `make browser-test`.
 *
 * The QUnit tests load the target classes without VisualEditor, and the PHPUnit tests never run
 * JavaScript. This script covers what falls between them in a real Chromium on a live wiki: a
 * Page Forms form with a VisualEditor textarea starts a real editor, and the toolbar offers the
 * switch to the wikitext editor, with and without the class toolbarOnTop.
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

( async () => {
	createPage( 'Template:VEForAllSmoke', '<includeonly>{{{text|}}}</includeonly>' );
	for ( const variant of VARIANTS ) {
		createPage( `Form:${ variant.form }`, formDefinition( variant.textareaArguments ) );
	}

	const browser = await chromium.launch();
	try {
		for ( const variant of VARIANTS ) {
			await checkVariant( browser, variant );
		}
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
