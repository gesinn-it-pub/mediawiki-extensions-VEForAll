<?php

namespace VEForAll\Tests\Integration;

use MediaWiki\Context\RequestContext;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use VEForAll\VEForAllHooks;

/**
 * @group Database
 * @covers \VEForAll\VEForAllHooks
 */
class VEForAllHooksTest extends MediaWikiIntegrationTestCase {

	private function newHooks(): VEForAllHooks {
		return new VEForAllHooks( $this->getServiceContainer()->getHookContainer() );
	}

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
		$config = $this->newHooks()->getToolbarConfig( $type );

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

		$config = $this->newHooks()->getToolbarConfig( $type );

		$this->assertSame( [ $expectedHook ], $calls );
		$this->assertSame( [ 'include' => [ 'added-by-hook' ] ], end( $config ) );
	}

	/**
	 * @dataProvider provideToolbarTypes
	 */
	public function testToolbarConfigStartsFromTheDefaultsOnEveryCall( string $type, string $hook ): void {
		$defaults = $this->newHooks()->getToolbarConfig( $type );

		$this->setTemporaryHook( $hook, static function ( array &$config ) {
			$config[] = [ 'include' => [ 'added-by-hook' ] ];
		} );
		$this->newHooks()->getToolbarConfig( $type );
		$this->newHooks()->getToolbarConfig( $type );
		$this->clearHook( $hook );

		$this->assertSame(
			$defaults,
			$this->newHooks()->getToolbarConfig( $type ),
			'changes made by a hook handler must not leak into later calls'
		);
	}

	public function testWideToolbarOnlyAddsTheMediaButtonToTheNormalOne(): void {
		$normal = $this->newHooks()->getToolbarConfig( 'normal' );
		$wide = $this->newHooks()->getToolbarConfig( 'wide' );

		$this->assertSameSize( $normal, $wide, 'same groups' );
		foreach ( $normal as $i => $group ) {
			if ( $group['name'] === 'insert' ) {
				$this->assertSame( array_merge( [ 'media' ], $group['include'] ), $wide[$i]['include'] );
				unset( $group['include'], $wide[$i]['include'] );
			}
			$this->assertSame( $group, $wide[$i], 'group ' . $group['name'] );
		}
	}

	public function testGlobalVariablesExposeBothToolbarConfigs(): void {
		$vars = [];

		$this->newHooks()->onMakeGlobalVariablesScript( $vars, RequestContext::getMain()->getOutput() );

		$this->assertSame( $this->newHooks()->getToolbarConfig( 'normal' ), $vars['VEForAllToolbarNormal'] );
		$this->assertSame( $this->newHooks()->getToolbarConfig( 'wide' ), $vars['VEForAllToolbarWide'] );
	}

	public function testStaticAccessKeepsWorkingForOtherExtensions(): void {
		$this->assertSame(
			$this->newHooks()->getToolbarConfig( 'wide' ),
			VEForAllHooks::getVeToolbarConfig( 'wide' )
		);
	}

	public function testHandlerIsRegisteredForMakeGlobalVariablesScript(): void {
		$vars = [];
		// All handlers of the hook run, also the one of VisualEditor, which needs a page.
		RequestContext::getMain()->setTitle( Title::makeTitle( NS_MAIN, 'Test' ) );
		$out = RequestContext::getMain()->getOutput();

		$this->getServiceContainer()->getHookContainer()
			->run( 'MakeGlobalVariablesScript', [ &$vars, $out ] );

		$this->assertArrayHasKey( 'VEForAllToolbarNormal', $vars );
		$this->assertArrayHasKey( 'VEForAllToolbarWide', $vars );
	}

	public function testHandlerIsRegisteredForBeforePageDisplay(): void {
		$context = RequestContext::getMain();
		$output = new OutputPage( $context );

		$this->getServiceContainer()->getHookContainer()
			->run( 'BeforePageDisplay', [ $output, $context->getSkin() ] );

		$this->assertContains( 'ext.veforall.core.desktop', $output->getModules() );
	}

	public function testDesktopModuleIsAddedToThePage(): void {
		$context = RequestContext::getMain();
		$output = new OutputPage( $context );

		$this->newHooks()->onBeforePageDisplay( $output, $context->getSkin() );

		$this->assertContains( 'ext.veforall.core.desktop', $output->getModules() );
	}
}
