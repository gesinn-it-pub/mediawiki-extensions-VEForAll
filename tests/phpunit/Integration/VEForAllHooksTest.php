<?php

namespace VEForAll\Tests\Integration;

use MediaWiki\Context\RequestContext;
use MediaWiki\Output\OutputPage;
use MediaWikiIntegrationTestCase;
use VEForAll\VEForAllHooks;

/**
 * @covers \VEForAll\VEForAllHooks
 */
class VEForAllHooksTest extends MediaWikiIntegrationTestCase {

	/**
	 * @return array[] Pairs of the toolbar type and the hook that must be run for it
	 */
	public static function provideToolbarTypes(): array {
		return [
			'normal' => [ 'normal', 'VEForAllToolbarConfigNormal', 'VEForAllToolbarConfigWide' ],
			'wide' => [ 'wide', 'VEForAllToolbarConfigWide', 'VEForAllToolbarConfigNormal' ],
		];
	}

	/**
	 * @dataProvider provideToolbarTypes
	 */
	public function testToolbarConfigIsAListOfGroups( string $type ): void {
		$config = VEForAllHooks::getVeToolbarConfig( $type );

		$this->assertNotEmpty( $config );
		$this->assertSame( array_keys( $config ), range( 0, count( $config ) - 1 ), 'config is a list' );
		foreach ( $config as $group ) {
			$this->assertArrayHasKey( 'include', $group );
		}
	}

	/**
	 * @dataProvider provideToolbarTypes
	 */
	public function testToolbarConfigRunsOnlyTheHookOfItsType(
		string $type, string $expectedHook, string $otherHook
	): void {
		$calls = [];
		$this->setTemporaryHook( $expectedHook, static function ( array &$config ) use ( &$calls, $expectedHook ) {
			$calls[] = $expectedHook;
			$config[] = [ 'include' => [ 'added-by-hook' ] ];
		} );
		$this->setTemporaryHook( $otherHook, static function () use ( &$calls, $otherHook ) {
			$calls[] = $otherHook;
		} );

		$config = VEForAllHooks::getVeToolbarConfig( $type );

		$this->assertSame( [ $expectedHook ], $calls );
		$this->assertSame( [ 'include' => [ 'added-by-hook' ] ], end( $config ) );
	}

	/**
	 * @dataProvider provideToolbarTypes
	 */
	public function testToolbarConfigStartsFromTheDefaultsOnEveryCall( string $type, string $hook ): void {
		$defaults = VEForAllHooks::getVeToolbarConfig( $type );

		$this->setTemporaryHook( $hook, static function ( array &$config ) {
			$config[] = [ 'include' => [ 'added-by-hook' ] ];
		} );
		VEForAllHooks::getVeToolbarConfig( $type );
		VEForAllHooks::getVeToolbarConfig( $type );
		$this->clearHook( $hook );

		$this->assertSame(
			$defaults,
			VEForAllHooks::getVeToolbarConfig( $type ),
			'changes made by a hook handler must not leak into later calls'
		);
	}

	public function testGlobalVariablesExposeBothToolbarConfigs(): void {
		$vars = [];

		VEForAllHooks::onMakeGlobalVariablesScript( $vars, RequestContext::getMain()->getOutput() );

		$this->assertSame( VEForAllHooks::getVeToolbarConfig( 'normal' ), $vars['VEForAllToolbarNormal'] );
		$this->assertSame( VEForAllHooks::getVeToolbarConfig( 'wide' ), $vars['VEForAllToolbarWide'] );
	}

	public function testDesktopModuleIsAddedToThePage(): void {
		$context = RequestContext::getMain();
		$output = new OutputPage( $context );

		VEForAllHooks::onBeforePageDisplay( $output, $context->getSkin() );

		$this->assertContains( 'ext.veforall.core.desktop', $output->getModules() );
	}
}
