# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

- Require MediaWiki 1.43 or newer (was 1.42) [`f263adb`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/f263adb)

### Changed

- Document requirements, installation, usage, the toolbar hooks and the API in the README [`cea076e`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/cea076e)
- Add the GPL-2.0 license text to the repository [`b8423d9`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/b8423d9)
- Update development dependencies: mediawiki-codesniffer to 52.0.2 [`bb28f57`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/bb28f57) and eslint-config-wikimedia to 0.33.1 [`5b6b36c`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/5b6b36c)
- Remove unreachable code in the API module [`ce01ff0`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/ce01ff0) and outdated annotations in the hooks [`fcdb05b`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/fcdb05b)

### Fixed

- Fix changes of `VEForAllToolbarConfigNormal` and `VEForAllToolbarConfigWide` hook handlers piling up and affecting later toolbar configurations [`98b9b46`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/98b9b46)
- Log API usage errors as text instead of an object [`96d5fe5`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/96d5fe5)

## [0.8.1] - 2026-10-20

Fixed support for MediaWiki 1.47 and removed unnecessary "uneditable element" warnings. See the
[extension page](https://www.mediawiki.org/wiki/Extension:VEForAll) for the history of earlier versions.

[Unreleased]: https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/compare/0.8.1...HEAD
[0.8.1]: https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/releases/tag/0.8.1
