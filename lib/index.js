var request = require("request");
var xml2js = require("xml2js");
var debug = require("debug")("smartoys");
var async = require("async");
var _ = require("lodash");
var moment = require("moment");

var Common = require("./common");

var platforms = Common.platforms;
var feeds = Common.feeds;
var Parser = new xml2js.Parser();

module.exports = {
  PLATFORMS: platforms,
  FEEDS    : feeds,
  getFeed  : getFeed
};

function getFeed(feed, platform, callback) {
  debug("feed: " + feed);
  debug("platform: " + platform);

  var rss = {};
  var feedResult;
  var platformResult;
  var uri;

  if (typeof feed === "function")
    callback = feed;
  if (typeof platform === "function")
    callback = platform;

  feedResult = Common.validateFeedParameter(feed);
  platformResult = Common.validatePlatformParameter(platform);

  if (feedResult || platformResult)
    return callback(feedResult || platformResult);

  uri = Common.uri(feed, platform);
  rss.feed = feed;
  rss.platform = platform;

  async.waterfall(
    [
      function (next) {
        downloadFeedData(uri, next);
      },
      function (xml, next) {
        Parser.parseString(xml, next);
      },
      function (json, next) {
        parseJSONData(json, rss, next);
      }
    ],
    callback
  );
}

function downloadFeedData(uri, callback) {
  debug("uri: " + uri);

  request.get(
    uri,
    function (err, res, body) {
      if (err)
        return callback(err);

      debug("Response HTTP status code: " + res.statusCode);

      switch (res.statusCode) {
        case 200:
          callback(null, body);
          break;
        default:
          callback(new Error("HTTP status code : " + res.statusCode));
      }
    }
  );
}

function parseJSONData(data, rss, callback) {
  var channel = data.rss.channel[ 0 ];
  var items = [];

  rss.title = channel.title[ 0 ];
  rss.language = channel.language[ 0 ];
  rss.lastBuildDate = moment(channel.lastBuildDate[ 0 ]).unix();

  async.each(
    channel.item,
    function (element, next) {
      var item = { link: element.link[ 0 ] };
      var description = element.description[ 0 ];
      var urls = [];
      var numbers = [];
      var result;

      while (result = Common.imageUrlRegex.exec(description)) { urls.push(result[ 1 ]); }
      while (result = Common.priceRegex.exec(element.title[ 0 ])) { numbers.push(result[ 1 ]); }

      var lastIndex = element.title[ 0 ].lastIndexOf("-");
      var itemPrice = parseFloat(numbers[ numbers.length - 1 ]);

      item.title = element.title[ 0 ].slice(0, lastIndex).trim();
      item.image = urls[ 0 ];

      if (itemPrice > 0)
        item.price = itemPrice;
      if (element.category[ 0 ].length > 0)
        item.category = element.category[ 0 ];

      items.push(item);

      next();
    },
    function (err) {
      if (err)
        return callback(err);

      rss.items = items;

      debug(rss);

      callback(null, rss);
    }
  );
}
