/**
 * Sandcrawler Logger Plugin
 * ==========================
 *
 * A simple log plugin providing a colorful output to a sandcrawler spider
 * for debugging and monitoring purposes.
 */
var winston = require('winston'),
    util = require('util'),
    chalk = require('chalk');

// Helpers
function rs(string, nb) {
  var s = string,
      l,
      i;

  if (nb <= 0)
    return '';

  for (i = 1, l = nb | 0; i < l; i++)
    s += string;
  return s;
}

function highlightUrl(url) {
  return chalk.gray.bold(url);
}

/**
 * Custom Transport
 */
var SandcrawlerLogger = winston.transports.SandcrawlerLogger = function (options) {

  // Name
  this.name = 'sandcrawler';

  // Level
  this.level = options.level || 'debug';
  this.spiderColor = options.spiderColor || 'magenta';
  this.spiderName = options.spiderName;
  this.out = options.out || console.log;

  // Colors
  this.colors = {
    debug: 'blue',
    verbose: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  };
};

util.inherits(SandcrawlerLogger, winston.Transport);

SandcrawlerLogger.prototype.log = function(level, msg, meta, callback) {

  // Writing text
  var txt = '';
  txt += chalk[this.spiderColor](this.spiderName);
  txt += '/' + chalk.bold[this.colors[level]](level);
  txt += '' + rs(' ', Math.abs(level.length - 8)) + msg;

  // Outputting
  this.out(txt);

  // All went well...
  callback(null, true);
};

/**
 * Plugin
 */
module.exports = function(opts) {
  opts = opts || {};

  // Bootstrap
  return function(spider) {

    // Creating logger
    var log = new (winston.Logger)({
      transports: [
        new (winston.transports.SandcrawlerLogger)({
          level: opts.level,
          spiderColor: opts.color,
          spiderName: spider.name,
          out: opts.out
        })
      ]
    });

    // Assigning the logger to the spider instance
    this.logger = log;

    // Spider level listeners
    spider.once('spider:start', function() {
      log.info('Starting...');
    });

    spider.once('spider:fail', function() {
      log.error('Spider failed.');
    });

    spider.once('spider:success', function() {
      log.info('Spider ended.');
    });

    // Page level listeners
    spider.on('page:log', function(data, req) {
      log.debug('Page ' + chalk.gray.bold(req.url) +
                ' logging: ' + chalk.cyan(data.message));
    });

    spider.on('page:error', function(data, req) {
      log.debug('Page ' + chalk.gray.bold(req.url) +
                ' error: ' + chalk.red(data.message));
    });

    // Job level listeners
    spider.on('job:scrape', function(job) {
      log.info('Scraping ' + highlightUrl(job.req.url));
    });

    spider.on('job:success', function(job) {
      log.info('Job ' + highlightUrl(job.req.url) +
               ' completed ' + chalk.green('successfully.'));
    });

    spider.on('job:fail', function(err, job) {
      log.warn('Job ' + highlightUrl(job.req.url) +
               ' failed ' + chalk.red('[Error: ' + err.message + ']'));
    });

    spider.on('job:add', function(job) {
      log.info('Job ' + highlightUrl(job.req.url) + chalk.blue(' added') +
               ' to the stack.');
    });

    spider.on('job:retry', function(job) {
      var m = this.settings.maxRetries;

      log.verbose('Retrying job ' + highlightUrl(job.req.url) + ' (' +
                  job.req.retries + (m ? '/' + m : '') + ' retries)');
    });
  };
};
