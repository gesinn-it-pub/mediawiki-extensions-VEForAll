<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

// MediaWiki 1.43 is the oldest supported version and requires PHP 8.1.
$cfg['minimum_target_php_version'] = '8.1';

// The baseline only exists while a pre-existing issue is deliberately deferred.
if ( file_exists( __DIR__ . '/baseline.php' ) ) {
	$cfg['baseline_path'] = __DIR__ . '/baseline.php';
}

$IP = getenv( 'MW_INSTALL_PATH' ) !== false
	? str_replace( '\\', '/', getenv( 'MW_INSTALL_PATH' ) )
	: '../..';

// Required extensions: known to Phan, but not analysed.
$dependencyExtensions = [ 'VisualEditor' ];

foreach ( $dependencyExtensions as $ext ) {
	$cfg['directory_list'][] = $IP . '/extensions/' . $ext;
	$cfg['exclude_analysis_directory_list'][] = $IP . '/extensions/' . $ext;
}

return $cfg;
