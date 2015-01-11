var util = require("util");

var AbstractError = require("./abstract_error");

util.inherits(UnknownFeedTypeError, AbstractError);

function UnknownFeedTypeError(message) {
  AbstractError.call(this, message, this.constructor);
  this.name = "UnknownFeedTypeError";
}

module.exports = UnknownFeedTypeError;
