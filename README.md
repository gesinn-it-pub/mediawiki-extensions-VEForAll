# VEForAll

VEForAll ("VisualEditor For All") is a MediaWiki extension that lets other extensions use VisualEditor inside
textareas. It does nothing on its own: it provides a jQuery function, `applyVisualEditor()`, that turns any
textarea into a VisualEditor instance, plus an API module that converts between wikitext and HTML.

Extensions that build on it include Page Forms, CommentStreams, FlexForm and VisualData.

Homepage: <https://www.mediawiki.org/wiki/Extension:VEForAll>

## Requirements

- MediaWiki 1.43 or newer
- The [VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor) extension

## Installation

1. Place the `VEForAll` directory in the `extensions/` directory of your wiki.
2. Add the following to `LocalSettings.php`:

   ```php
   wfLoadExtension( 'VEForAll' );
   ```

3. Check `Special:Version` to verify the installation.

## Usage

### From JavaScript

Call `applyVisualEditor()` on a jQuery selection of textareas:

```js
$( 'textarea.myeditor' ).applyVisualEditor();
```

- Add the class `toolbarOnTop` to a textarea to get the toolbar at the top of the editor (the "wide" toolbar)
  instead of the compact default.
- `$.fn.getVEInstances()` returns the editor instances created so far.
- The event `VEForAllLoaded` is triggered on `document` when VEForAll has started the VisualEditor initialisation.

### With Page Forms

Add `editor=visualeditor` to the textarea field in the form definition (and `class=toolbarOnTop` for the toolbar at
the top).

## Configuring the toolbar

The toolbar is a list of groups. Which hook runs depends on the textarea: `VEForAllToolbarConfigWide` for
textareas with the class `toolbarOnTop`, `VEForAllToolbarConfigNormal` for all others. Each handler receives the
list by reference and can change it. Every call starts from the defaults, so changes do not carry over between
calls.

The groups of the default configuration have the names `paragraph-format`, `text-style`, `links`, `structure` and
`insert`. Add a button to the insert group like this:

```php
$wgHooks['VEForAllToolbarConfigNormal'][] = static function ( array &$config ) {
	foreach ( $config as &$group ) {
		if ( ( $group['name'] ?? '' ) === 'insert' ) {
			$group['include'][] = 'math';
		}
	}
};
```

Use the same handler for `VEForAllToolbarConfigWide` to change the wide toolbar. Buttons such as `math` or
`reference` only work when the extension that provides them (Math, Cite) is installed. The default `Wide` toolbar
additionally contains the `media` button.

## API

The module `veforall-parsoid-utils` converts content between wikitext and HTML:

| Parameter | Description |
|---|---|
| `from` | Format of the content: `wikitext` or `html` |
| `to` | Format to convert to: `wikitext` or `html` |
| `content` | The content to convert |
| `title` or `pageid` | The page the content belongs to (one of them is required) |

Example: `api.php?action=veforall-parsoid-utils&from=wikitext&to=html&content=''blah''&title=Main_Page`

## Development

Tests and linters run in the Docker environment of
[docker-compose-ci](https://github.com/gesinn-it-pub/docker-compose-ci), which is included as the `build` submodule:

```shell
git submodule update --init
make ci                # lint, PHPCS, PHPUnit, ESLint, banana checker
make ci-coverage       # the same with a PHP coverage report in build/coverage/php
make composer-analyze  # Phan
```

Run a single PHPUnit test with
`make install composer-phpunit COMPOSER_PARAMS="-- --filter VEForAllHooksTest"`. `MW_VERSION`, `PHP_VERSION` and
`DB_IMAGE` can be overridden on the command line to test other MediaWiki versions, for example
`make ci MW_VERSION=1.46 PHP_VERSION=8.4`.

Dependencies are kept up to date by Renovate. See [CHANGELOG.md](CHANGELOG.md) for the changes of each version.

## Credits

Authors: Pierre Boutet, Clément Flipo, Ike Hecht, Yaron Koren, Cindy Cicalese.

The API module is mostly copied from the `ApiParsoidUtils` and `Utils` classes of the StructuredDiscussions
extension. See that extension for attribution.

## License

GPL-2.0-or-later, see [COPYING](COPYING).
