var _ = require("lodash");
var clone = require("clone");
var qs = require("querystring");

var UnknownFeedTypeError = require("./errors/unknown_feed_type_error");
var UnknownPlatformTypeError = require("./errors/unknown_platform_type_error");

var platforms = [ "xbox-360", "pc", "ps-vita", "ps3", "xbox-one", "ps4", "wii-u", "nintendo-3ds" ];
var feeds = [ "upcoming", "topseller", "news" ];
var baseParams = { feedkind: null, categories_id: null };
var baseUrl = "http://www.smartoys.be/catalog/rss.php?";
var imageUrlRegex = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/g;
var priceRegex = /[\$\£\€]?(\d+(?:\.\d{1,2})?)/g;
var platformsCategoryId = {
  "xbox-360"    : 246,
  "pc"          : 8,
  "ps-vita"     : 480,
  "ps3"         : 332,
  "xbox-one"    : 558,
  "ps4"         : 537,
  "wii-u"       : 463,
  "nintendo-3ds": 433
};

module.exports = {
  platforms                : platforms,
  feeds                    : feeds,
  imageUrlRegex            : imageUrlRegex,
  priceRegex               : priceRegex,
  validateFeedParameter    : validateFeedParameter,
  validatePlatformParameter: validatePlatformParameter,
  uri                      : uri
};

function validateFeedParameter(feed) {
  var index = _.findIndex(feeds, function (element) { return element === feed; });

  if (index == -1)
    return new UnknownFeedTypeError("Received feed type \"" + feed + "\", expected one of " + feeds.join(","));
  else
    return null;
}

function validatePlatformParameter(platform) {
  var index = _.findIndex(platforms, function (element) { return element === platform; });

  if (index == -1)
    return new UnknownPlatformTypeError("Received platform type \"" + platform + "\", expected one of " + platforms.join(","));
  else
    return null;
}

function uri(feed, platform) {
  var params = clone(baseParams);

  params.feedkind = feed;
  params.categories_id = platformsCategoryId[ platform ];

  return baseUrl + qs.stringify(params);
}
