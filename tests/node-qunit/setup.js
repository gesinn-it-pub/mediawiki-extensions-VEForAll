'use strict';

/**
 * Loads the target classes of VEForAll into plain Node.
 *
 * Only the parts of VisualEditor and MediaWiki that the files touch while they load are replaced.
 * OOjs is the real library, so inheritance of the static properties behaves as in the browser.
 * A real toolbar, tool registration and rendering are covered by the browser test instead.
 */

const OO = require( 'oojs' );

// Stand-in for ve.init.mw.Target: the static members that VEForAll reads or replaces.
function Target() {}
OO.initClass( Target );
Target.static.toolbarGroups = [];
Target.static.importRules = {
	external: { blacklist: [ 'link/mwExternal', 'link/mwInternal' ] }
};

OO.ui = {
	deferMsg: ( key ) => () => key
};

global.OO = OO;
global.ve = {
	init: {
		mw: {
			Target: Target,
			targetFactory: { register: () => {} }
		}
	},
	copy: ( value ) => JSON.parse( JSON.stringify( value ) )
};

// The toolbar configurations that VEForAllHooks hands to JavaScript (same shape, fewer entries).
const toolbarConfig = {
	VEForAllToolbarNormal: [
		{
			name: 'paragraph-format',
			header: 'visualeditor-toolbar-paragraph-format',
			include: { group: 'format' }
		},
		{ name: 'insert', include: [ 'insertTable' ] }
	],
	VEForAllToolbarWide: [
		{
			name: 'paragraph-format',
			header: 'visualeditor-toolbar-paragraph-format',
			include: { group: 'format' }
		},
		{ name: 'insert', include: [ 'media', 'insertTable' ] }
	]
};

// jQuery is only called by the editor constructor, to mark the textarea as pending.
const chainable = { prop: () => chainable, addClass: () => chainable };
global.jQuery = () => chainable;

global.mediaWiki = {
	config: {
		get: ( name ) => name === 'wgVisualEditorConfig' ? { pluginModules: [] } : toolbarConfig[ name ]
	},
	loader: {
		getState: () => 'ready',
		// VisualEditor is never loaded here, so the editor stays in the state before it is ready.
		using: () => {}
	}
};

require( '../../resources/ext.veforall.target.js' );
require( '../../resources/ext.veforall.targetwide.js' );
require( '../../resources/ext.veforall.editor.js' );
