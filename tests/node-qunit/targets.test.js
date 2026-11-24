'use strict';

const getGroup = ( target, name ) => target.static.toolbarGroups.find(
	( group ) => group.name === name
);

const bothTargets = () => [ mediaWiki.veForAll.Target, mediaWiki.veForAll.Targetwide ];

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

QUnit.test( 'the wide target offers the switch to the wikitext editor', ( assert ) => {
	const group = getGroup( mediaWiki.veForAll.Targetwide, 've4aSwitch' );

	assert.notStrictEqual( group, undefined, 'the group exists' );
	assert.deepEqual( group && group.include, [ 've4aSwitchEditor' ] );
	assert.strictEqual( group && group.align, 'after' );
} );

QUnit.module( 'VEForAll targets: setSwitchable', {
	beforeEach: function () {
		// setSwitchable() changes the static lists of the classes, so restore them.
		this.saved = bothTargets().map( ( targetClass ) => targetClass.static.toolbarGroups );
	},
	afterEach: function () {
		bothTargets().forEach( ( targetClass, i ) => {
			targetClass.static.toolbarGroups = this.saved[ i ];
		} );
	}
} );

QUnit.test( 'setSwitchable( false ) removes the switch from both targets', ( assert ) => {
	mediaWiki.veForAll.Target.static.setSwitchable( false );

	assert.strictEqual(
		getGroup( mediaWiki.veForAll.Target, 've4aSwitch' ), undefined, 'normal target'
	);
	assert.strictEqual(
		getGroup( mediaWiki.veForAll.Targetwide, 've4aSwitch' ), undefined, 'wide target'
	);
} );

QUnit.test( 'setSwitchable( true ) offers the edit modes in both targets', ( assert ) => {
	mediaWiki.veForAll.Target.static.setSwitchable( true );

	bothTargets().forEach( ( targetClass ) => {
		const group = getGroup( targetClass, 've4aSwitch' );

		assert.notStrictEqual( group, undefined, `${ targetClass.static.name }: the group exists` );
		assert.deepEqual(
			group && group.include,
			[ 'editModeVisual', 'editModeSource' ],
			`${ targetClass.static.name }: the edit modes`
		);
	} );
} );
