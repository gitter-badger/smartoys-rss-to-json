var util = require("util");

var AbstractError = require("./abstract_error");

util.inherits(UnknownPlatformTypeError, AbstractError);

function UnknownPlatformTypeError(message) {
  AbstractError.call(this, message, this.constructor);
  this.name = "UnknownPlatformTypeError";
}

module.exports = UnknownPlatformTypeError;
