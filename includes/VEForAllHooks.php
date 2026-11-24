<?php

namespace VEForAll;

use ExtensionRegistry;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\MakeGlobalVariablesScriptHook;
use OutputPage;
use Skin;

class VEForAllHooks implements BeforePageDisplayHook, MakeGlobalVariablesScriptHook {

	/** @var array[] */
	private static $defaultConfig = [
		'normal' => [
			[
				'name' => 'paragraph-format',
				'header' => 'visualeditor-toolbar-paragraph-format',
				'title' => 'visualeditor-toolbar-format-tooltip',
				'type' => 'menu',
				'include' => [
					'group' => 'format'
				],
				'promote' => [
					'paragraph'
				],
				'demote' => [
					'preformatted',
					'blockquote'
				]
			],
			[
				'name' => 'text-style',
				'header' => 'visualeditor-toolbar-text-style',
				'title' => 'visualeditor-toolbar-style-tooltip',
				'include' => [
					'bold',
					'italic',
					'moreTextStyle'
				]
			],
			[
				'name' => 'links',
				'include' => [
					'link'
				]
			],
			[
				'name' => 'structure',
				'header' => 'visualeditor-toolbar-structure',
				'title' => 'visualeditor-toolbar-structure',
				'type' => 'list',
				'icon' => 'listBullet',
				'include' => [
					'group' => 'structure'
				],
				'demote' => [
					'outdent',
					'indent'
				]
			],
			[
				'name' => 'insert',
				'header' => 'visualeditor-toolbar-insert',
				'title' => 'visualeditor-toolbar-insert',
				'type' => 'list',
				'icon' => 'add',
				'label' => '',
				'include' => [
					'insertTable',
					'specialCharacter',
					'warningblock',
					'preformatted',
					'infoblock',
					'ideablock',
					'dontblock',
					'pinblock',
				]
			]
		],
		'wide' => [
			[
				'name' => 'paragraph-format',
				'header' => 'visualeditor-toolbar-paragraph-format',
				'title' => 'visualeditor-toolbar-format-tooltip',
				'type' => 'menu',
				'include' => [
					'group' => 'format'
				],
				'promote' => [
					'paragraph'
				],
				'demote' => [
					'preformatted',
					'blockquote'
				]
			],
			[
				'name' => 'text-style',
				'header' => 'visualeditor-toolbar-text-style',
				'title' => 'visualeditor-toolbar-style-tooltip',
				'include' => [
					'bold',
					'italic',
					'moreTextStyle'
				]
			],
			[
				'name' => 'links',
				'include' => [
					'link'
				]
			],
			[
				'name' => 'structure',
				'header' => 'visualeditor-toolbar-structure',
				'title' => 'visualeditor-toolbar-structure',
				'type' => 'list',
				'icon' => 'listBullet',
				'include' => [
					'group' => 'structure'
				],
				'demote' => [
					'outdent',
					'indent'
				]
			],
			[
				'name' => 'insert',
				'header' => 'visualeditor-toolbar-insert',
				'title' => 'visualeditor-toolbar-insert',
				'type' => 'list',
				'icon' => 'add',
				'label' => '',
				'include' => [
					'media',
					'insertTable',
					'specialCharacter',
					'warningblock',
					'preformatted',
					'infoblock',
					'ideablock',
					'dontblock',
					'pinblock',
				]
			]
		]
	];

	private HookContainer $hookContainer;

	public function __construct( HookContainer $hookContainer ) {
		$this->hookContainer = $hookContainer;
	}

	/**
	 * Implements BeforePageDisplay hook.
	 * See https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage $output OutputPage object
	 * @param Skin $skin Skin object that will be used to generate the page
	 */
	public function onBeforePageDisplay( $output, $skin ): void {
		$services = MediaWikiServices::getInstance();
		if ( !(
			ExtensionRegistry::getInstance()->isLoaded( 'MobileFrontend' ) &&
			$services->getService( 'MobileFrontend.Context' )
				->shouldDisplayMobileView()
		) ) {
			$output->addModules( [
				'ext.veforall.core.desktop'
			] );
		}
	}

	/**
	 * @param array &$vars
	 * @param OutputPage $out
	 */
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		$vars[ 'VEForAllToolbarNormal' ] = $this->getToolbarConfig( 'normal' );
		$vars[ 'VEForAllToolbarWide' ] = $this->getToolbarConfig( 'wide' );
	}

	/**
	 * @param string $type 'normal' or 'wide'
	 *
	 * @return array The toolbar groups, after the VEForAllToolbarConfig* hooks have run
	 */
	public function getToolbarConfig( string $type = 'normal' ): array {
		// Hand the hooks a copy, so that their changes do not accumulate in the defaults.
		$config = self::$defaultConfig[ $type ];
		$this->hookContainer->run( 'VEForAllToolbarConfig' . ucfirst( $type ), [ &$config ] );
		return array_values( $config );
	}

	/**
	 * @deprecated Use getToolbarConfig() of an instance instead. Kept because other extensions
	 *  may call it statically.
	 *
	 * @param string $type 'normal' or 'wide'
	 *
	 * @return array
	 */
	public static function getVeToolbarConfig( $type = 'normal' ) {
		return ( new self( MediaWikiServices::getInstance()->getHookContainer() ) )->getToolbarConfig( $type );
	}

}
