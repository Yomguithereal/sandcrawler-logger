/**
 * Sandcrawler Logger Plugin
 * ==========================
 *
 * A simple log plugin providing a colorful output to a sandcrawler scraper
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
  this.scraperColor = options.scraperColor || 'magenta';
  this.scraperName = options.scraperName;

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
  txt += chalk[this.scraperColor](this.scraperName);
  txt += '/' + chalk.bold[this.colors[level]](level);
  txt += '' + rs(' ', Math.abs(level.length - 7)) + msg;

  // Outputting
  console.log(txt);

  // All went well...
  callback(null, true);
};

/**
 * Plugin
 */
module.exports = function(opts) {
  opts = opts || {};

  // Bootstrap
  return function(scraper) {

    // Creating logger
    var log = new (winston.Logger)({
      transports: [
        new (winston.transports.SandcrawlerLogger)({
          scraperColor: opts.color,
          scraperName: scraper.name
        })
      ]
    });

    // Assigning the logger to the scraper instance
    this.logger = log;

    // Scraper level listeners
    scraper.once('scraper:start', function() {
      log.info('Starting...');
    });

    scraper.once('scraper:fail', function() {
      log.error('Scraper failed.');
    });

    scraper.once('scraper:success', function() {
      log.info('Scraper ended.');
    });

    // Page level listeners
    scraper.on('page:log', function(data, req) {
      log.debug('Page ' + chalk.gray.bold(req.url) +
                ' logging: ' + chalk.cyan(data.message));
    });

    scraper.on('page:error', function(data, req) {
      log.debug('Page ' + chalk.gray.bold(req.url) +
                ' error: ' + chalk.red(data.message));
    });

    // Job level listeners
    scraper.on('job:scrape', function(job) {
      log.info('Scraping ' + highlightUrl(job.req.url));
    });

    scraper.on('job:success', function(job) {
      log.info('Job ' + highlightUrl(job.req.url) +
               ' completed ' + chalk.green('successfully.'));
    });

    scraper.on('job:fail', function(err, job) {
      log.warn('Job ' + highlightUrl(job.req.url) +
               ' failed ' + chalk.red('[Error: ' + err.message + ']'));
    });
  };
};
