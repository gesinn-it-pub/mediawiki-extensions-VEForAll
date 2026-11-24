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
- Clean up the JavaScript code: const declarations [`08e1a29`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/08e1a29), JSDoc types [`a7c7816`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/a7c7816), naming of jQuery collections [`bb2301c`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/bb2301c), shadowed variables [`f3b7069`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/f3b7069) and the iteration of the init callbacks [`b58a0c7`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/b58a0c7)
- Remove unreachable code in the API module [`ce01ff0`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/ce01ff0) and outdated annotations in the hooks [`fcdb05b`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/fcdb05b)

### Fixed

- Show the switch between the visual and the wikitext editor again in editors with the class `toolbarOnTop` (missing since 0.8.1) [`2df7f4b`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/2df7f4b)
- Stop `focus()` and `moveCursorToEnd()` calls made before VisualEditor is ready from also running in editors created later [`a3851df`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/a3851df)
- Fix changes of `VEForAllToolbarConfigNormal` and `VEForAllToolbarConfigWide` hook handlers piling up and affecting later toolbar configurations [`98b9b46`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/98b9b46)
- Log API usage errors as text instead of an object [`96d5fe5`](https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/commit/96d5fe5)

## [0.8.1] - 2026-10-20

Fixed support for MediaWiki 1.47 and removed unnecessary "uneditable element" warnings. See the
[extension page](https://www.mediawiki.org/wiki/Extension:VEForAll) for the history of earlier versions.

[Unreleased]: https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/compare/0.8.1...HEAD
[0.8.1]: https://github.com/gesinn-it-pub/mediawiki-extensions-VEForAll/releases/tag/0.8.1
