'use strict';

QUnit.module( 'VEForAll editor: calls that wait for VisualEditor' );

QUnit.test( 'a call made before the editor is ready is queued for this editor only', ( assert ) => {
	const first = new mediaWiki.veForAll.Editor( {}, '' );
	const second = new mediaWiki.veForAll.Editor( {}, '' );

	first.focus();

	assert.strictEqual( first.initCallbacks.length, 1, 'the call is queued for the first editor' );
	assert.strictEqual( second.initCallbacks.length, 0, 'the second editor has nothing queued' );
} );
