'use strict';

const getGroup = ( target, name ) => target.static.toolbarGroups.find(
	( group ) => group.name === name
);

QUnit.module( 'VEForAll targets: toolbar groups' );

QUnit.test( 'the normal target keeps the groups of the configuration in order', ( assert ) => {
	const names = mediaWiki.veForAll.Target.static.toolbarGroups.map( ( group ) => group.name );

	assert.deepEqual( names.slice( 0, 2 ), [ 'paragraph-format', 'insert' ] );
} );

QUnit.test( 'the normal target offers the switch to wikitext after the other groups', ( assert ) => {
	const groups = mediaWiki.veForAll.Target.static.toolbarGroups;
	const group = getGroup( mediaWiki.veForAll.Target, 've4aSwitch' );

	assert.strictEqual( groups[ groups.length - 1 ], group, 'it is the last group' );
	assert.deepEqual( group.include, [ 've4aSwitchEditor' ] );
	assert.strictEqual( group.align, 'after' );
} );

QUnit.test( 'the wide target uses the wide configuration', ( assert ) => {
	const insert = getGroup( mediaWiki.veForAll.Targetwide, 'insert' );

	assert.deepEqual( insert.include, [ 'media', 'insertTable' ] );
} );

QUnit.test( 'header texts of the groups are resolved lazily', ( assert ) => {
	const group = getGroup( mediaWiki.veForAll.Target, 'paragraph-format' );

	assert.strictEqual( typeof group.header, 'function' );
	assert.strictEqual( group.header(), 'visualeditor-toolbar-paragraph-format' );
} );
