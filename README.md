# sandcrawler-logger

Simple logger to plug into one of your [sandcrawler](http://medialab.github.io/sandcrawler/) spiders for immediate feedback.

## Installation

You can install **sandcrawler-logger** through npm:

```bash
npm install sandcrawler-logger
```

## Usage

```js
var sandcrawler = require('sandcrawler'),
    logger = require('sandcrawler-logger');

var spider = sandcrawler.spider('MyFancySpider')
  .use(logger())
  .url('http://nicesite.org')
  .scraper(function($, done) {
    done(null, $('title').text());
  })
  .run();
```

## Options

* **color** *?string* [`'magenta'`]: color attributed to your spider. This is useful when running several spiders at once when you want to clearly distinguish their respective logs.
* **level** *?string* [`'debug'`]: Threshold level for the log, order being: `debug`, `verbose`, `info`, `warn` and `error`.
* **pageLog** *?boolean* [`true`]: in case of a phantom spider, should we display the web page's log and errors?

## Spider's logger

When plugging the logger onto your spider, this one will be attached a `logger` so you can push custom log through the means of the plugin if needed.

```js
var sandcrawler = require('sandcrawler'),
    logger = require('sandcrawler-logger');

var spider = sandcrawler.spider('MyFancySpider')
  .use(logger())
  (...)
  .result(function(err, req, res) {
    this.logger.info('Page title: ', res.data);
  })
  .run();
```

## License

MIT
