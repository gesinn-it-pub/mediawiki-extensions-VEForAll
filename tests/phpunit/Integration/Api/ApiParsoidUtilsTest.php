<?php

namespace VEForAll\Tests\Integration\Api;

use ApiTestCase;
use ApiUsageException;

/**
 * @group API
 * @group Database
 * @covers \VEForAll\ApiParsoidUtils
 */
class ApiParsoidUtilsTest extends ApiTestCase {

	private function convert( array $params ): array {
		[ $result ] = $this->doApiRequest( [ 'action' => 'veforall-parsoid-utils' ] + $params );
		return $result['veforall-parsoid-utils'];
	}

	public function testConvertsWikitextToHtml(): void {
		$result = $this->convert( [
			'from' => 'wikitext', 'to' => 'html', 'content' => "''blah''", 'title' => 'Main Page',
		] );

		$this->assertSame( 'html', $result['format'] );
		$this->assertStringContainsString( 'blah', $result['content'] );
		$this->assertMatchesRegularExpression( '!<i[ >].*blah.*</i>!s', $result['content'] );
	}

	public function testConvertsHtmlToWikitext(): void {
		$result = $this->convert( [
			'from' => 'html', 'to' => 'wikitext', 'content' => '<p><i>blah</i></p>', 'title' => 'Main Page',
		] );

		$this->assertSame( 'wikitext', $result['format'] );
		$this->assertSame( "''blah''", $result['content'] );
	}

	public function testWikitextSurvivesRoundTrip(): void {
		$wikitext = "'''bold''' and ''italic''";

		$html = $this->convert( [
			'from' => 'wikitext', 'to' => 'html', 'content' => $wikitext, 'title' => 'Main Page',
		] )['content'];
		$result = $this->convert( [
			'from' => 'html', 'to' => 'wikitext', 'content' => $html, 'title' => 'Main Page',
		] );

		$this->assertSame( $wikitext, $result['content'] );
	}

	public function testSameFormatReturnsContentUnchanged(): void {
		$result = $this->convert( [
			'from' => 'wikitext', 'to' => 'wikitext', 'content' => "''blah''", 'title' => 'Main Page',
		] );

		$this->assertSame( "''blah''", $result['content'] );
	}

	public function testAcceptsPageIdInsteadOfTitle(): void {
		$page = $this->getExistingTestPage();

		$result = $this->convert( [
			'from' => 'wikitext', 'to' => 'html', 'content' => "''blah''", 'pageid' => $page->getId(),
		] );

		$this->assertStringContainsString( 'blah', $result['content'] );
	}

	public function testRequiresTitleOrPageId(): void {
		$this->expectException( ApiUsageException::class );

		$this->convert( [ 'from' => 'wikitext', 'to' => 'html', 'content' => "''blah''" ] );
	}

	public function testRejectsUnsupportedFormat(): void {
		$this->expectException( ApiUsageException::class );

		$this->convert( [ 'from' => 'markdown', 'to' => 'html', 'content' => 'x', 'title' => 'Main Page' ] );
	}
}
