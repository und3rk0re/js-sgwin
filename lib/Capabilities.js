"use strict";
var supportsColor = require("supports-color");


var Capabilities = {
    color: supportsColor,
    rgb: supportsColor,

    has: function has(name) {
        return process.argv.indexOf("--" + name) !== -1;
    },
    logEnabled: function logEnabled(name) {
        return this.has("log-" + name) || this.has("logall") || process.argv.indexOf("-vvv") !== -1;
    }
};

Capabilities.rgb = Capabilities.rgb && !Capabilities.has("norgb");

module.exports = Capabilities;