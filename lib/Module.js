
var stdout = process.stdout.write.bind(process.stdout)
  , caps = require("./Capabilities")
  , colors = require("./Colors");


var Module = function Module(options) {
    options = options || {};

    this.sync = options.sync === true || caps.has('logsync') || caps.has('logall');
    this.name = options.name || "";
    this.showName = !!this.name;
    this.localNoColor = !!options.nocolor;
    this.stream = options.stream || stdout;
};

var Stub = function Stub(options) {
    options = options || {};

    this.sync = options.sync === true;
    this.name = options.name || "";
    this.showName = !!this.name;
    this.localNoColor = !!options.nocolor;
    this.stream = options.stream || stdout;
};

var nullFunc = function (){};

function repeat(amount, char) {
    return amount > 0 ? new Array(amount + 1).join(char || " ") : "";
}

Module.prototype.with = function (name) {
    if (!name) {
        return this;
    }
    if (caps.logEnabled(name)) {
        return new Module({
            sync: this.sync,
            name: name,
            nocolor: this.localNoColor,
            stream: this.stream
        });
    } else {
        return new Stub({
            sync: this.sync,
            name: name,
            nocolor: this.localNoColor,
            stream: this.stream
        });
    }
};
Stub.prototype.with = Module.prototype.with;

Stub.prototype.getError = nullFunc;
Module.prototype.getError = function getError(error) {
    var buf = "";

    buf += this.getShieldedString("  ┏━━", colors.palette.errMsg + "Error " + colors.palette.exceptionMsg + error.message + colors.reset, null, colors.palette.exceptionGraph) + "\n";
    var chunks = error.stack.split("\n").slice(1).map(function(x) { return x.trim().substring(3);});
    var funcs = [], places = [], maxFunc = 0, maxPlace = 0, i, j, funcI, placeI;

    // Calculating table
    for (i = 0; i < chunks.length; i++) {
        j = chunks[i].indexOf(" ");
        if (j === -1) {
            funcI = "";
            placeI = chunks[i];
        } else {
            funcI = chunks[i].substr(0, j);
            placeI = chunks[i].substr(j+1);
        }

        if (placeI.substr(0, 1) === "(") {
            placeI = placeI.substr(1);
        }
        if (placeI.substr(placeI.length - 1, 1) === ")") {
            placeI = placeI.substr(0, placeI.length -1);
        }

        funcs.push(funcI);
        places.push(placeI);

        if (funcI.length > maxFunc) {
            maxFunc = funcI.length;
        }
        if (placeI.length > maxPlace) {
            maxPlace = placeI.length;
        }
    }

    // Building table
    for (i = 0; i < chunks.length; i++) {
        buf += this.getShieldedString(
            (i === chunks.length - 1) ? "  ┗  " : "  ┃  ",
            colors.palette.exceptionFunc + funcs[i] + colors.reset
            + repeat(maxFunc - funcs[i].length + 1, " ")
            + colors.palette.exceptionLine + places[i] + colors.reset,
            null,
            colors.palette.exceptionGraph
        ) + "\n";
    }

    return buf;
};

Stub.prototype.getShieldedString = nullFunc;
Module.prototype.getShieldedString = function getShieldedString(shield, message, placeholders, shieldColor, messageColor) {
    if (this.localNoColor) {
        shieldColor = null;
        messageColor = null;
    }

    var buf = "";
    if (shield && shieldColor) {
        buf += shieldColor;
    }
    if (shield) {
        buf += shield;
    }
    if (shield && shieldColor) {
        buf += colors.reset;
    }
    if (shield) {
        buf += " ";
    }

    if (this.showName) {
        buf += colors.palette.name + this.name + colors.reset;
        buf += " ";
    }

    if (message && messageColor) {
        buf += messageColor;
    }
    if (message) {
        // Performing variable interpolation
        if (placeholders) {
            message = message.replace(/[ ,\.=]:([0-9a-z\.\-_]+[0-9a-z])/ig, function (full, key) {

                var val;
                if (typeof placeholders === "object") {
                    if (!placeholders.hasOwnProperty(key)) {
                        return " " + colors.palette.typeUndef + ":" + key + colors.reset + messageColor;
                    }

                    val = placeholders[key];
                } else {
                    val = placeholders;
                }

                if (val === null) {
                    return " " + colors.palette.typeSpecial + "⟨null⟩" + colors.reset + messageColor;
                }
                if (typeof val === "boolean") {
                    return " " + colors.palette.typeSpecial + (val ? "⟨true⟩" : "⟨false⟩") + colors.reset + messageColor;
                }
                if (typeof val === "number") {
                    return " " + colors.palette.typeInt + val + colors.reset + messageColor;
                }
                if (typeof val === "string") {
                    return " " + colors.palette.typeString + "«" + val + "»" + colors.reset + messageColor;
                }

                return " " + colors.palette.typeUndef + key + messageColor;
            });
        }

        buf += message;
    }
    if (message && messageColor) {
        buf += colors.reset;
    }

    return buf;
};

Module.prototype.print = function print(message) {
    if (this.sync || this.name === "") {
        this.stream(message);
    } else {
        setImmediate(this.stream, message);
    }
};

Stub.prototype.info = nullFunc;
Module.prototype.info = function info(message, placeholders) {
    this.print(this.getShieldedString("  ▪  ", message, placeholders, colors.palette.infoTag, colors.palette.infoMsg) + "\n");
};
Stub.prototype.warn = nullFunc;
Module.prototype.warn = function warn(message, placeholders) {
    this.print(this.getShieldedString("  ⚑  ", message, placeholders, colors.palette.warnTag, colors.palette.warnMsg) + "\n");
};
Stub.prototype.error = nullFunc;
Module.prototype.error = function error(message, placeholders) {
    if (!placeholders && message instanceof Error) {
        this.print(this.getError(message));
    } else {
        this.print(this.getShieldedString("  ✗  ", message, placeholders, colors.palette.errTag, colors.palette.errMsg) + "\n");
    }
};
Stub.prototype.fail = nullFunc;
Module.prototype.fail = Module.prototype.error;
Stub.prototype.success = nullFunc;
Module.prototype.success = function success(message, placeholders) {
    this.print(this.getShieldedString("  ✓  ", message, placeholders, colors.palette.successTag, colors.palette.successMsg) + "\n");
};
Stub.prototype.in = nullFunc;
Module.prototype.in = function (message, placeholders) {
    this.print(this.getShieldedString(" ❮❮❮ ", message, placeholders, colors.palette.inTag, colors.palette.inMsg) + "\n");
};
Stub.prototype.out = nullFunc;
Module.prototype.out = function out(message, placeholders) {
    this.print(this.getShieldedString(" ❯❯❯ ", message, placeholders, colors.palette.outTag, colors.palette.outTag) + "\n");
};
Stub.prototype.fancyPrint = nullFunc;
Module.prototype.fancyPrint = function fancyPrint() {
    var message = "", i, j, t, h;
    for (i = 0; i < arguments.length; i++) {
        j = arguments[i];
        if (typeof  j === "string") {
            j = {text: j};
        }

        h = false;
        t = j.text;
        if (j.right && t.length < j.right) {
            t = repeat(j.right - t.length, ' ') + t;
        } else if (j.left && t.length < j.left) {
            t = t + repeat(j.left - t.length, ' ');
        }

        if (j.bg && colors.bg.hasOwnProperty(j.bg)) {
            h = true;
            t = colors.bg[j.bg] + t;
        }
        if (j.fg && colors.fg.hasOwnProperty(j.fg)) {
            h = true;
            t = colors.fg[j.fg] + t;
        }
        if (j._ || j.underline) {
            h = true;
            t = colors.underline + t;
        }
        if (j.bold) {
            h = true;
            t = colors.bold + t;
        }

        message += t + (h ? colors.reset : "");
    }

    this.print(message + "\n");
};
Stub.prototype.dump = nullFunc;
Module.prototype.dump = function dump(value, name, annotate) {
    var buf = "";
    annotate = annotate !== false;
    if (annotate) {
        buf += colors.bg.black + colors.fg.white + " dump: ";
    }
    buf += recursiveDump(value, name);

    this.print(buf + "\n");
};
function recursiveDump(value, name, pre)
{
    pre = pre || "";
    var pref = pre || "";
    if (name) {
        pref += colors.fg.yellow + colors.italic + name + ":" + colors.reset;
    }

    if (value === null) {
        return pref + colors.fg.magenta + colors.bold + "null" + colors.reset;
    }
    if (typeof value === "function") {
        return pref + colors.fg.magenta + colors.bold + "function" + colors.reset;
    }
    if (typeof value === "boolean") {
        return pref + colors.fg.green + "b:" + colors.fg.magenta + colors.bold + (value ? "true" : "false") + colors.reset;
    }
    if (typeof value === "number") {
        return pref + colors.fg.green + "n:" + colors.fg.blue + colors.bold + value + colors.reset;
    }
    if (typeof value === "string") {
        return pref + colors.fg.green + "s" + value.length + ":" + colors.bold + value + colors.reset;
    }
    var buf;
    if (Array.isArray(value)) {
        buf = pref + colors.fg.green + "[" + colors.reset + "\n";
        for (var i = 0; i < value.length; i++) {
            buf += recursiveDump(value[i], null, pre + "  ") + "\n";
        }
        return buf + pre + colors.fg.green + "]" + colors.reset;
    }
    if (typeof value === "object") {
        buf = pref + colors.fg.green + "{" + colors.reset + "\n";
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                buf += recursiveDump(value[key], key, pre + "  ") + "\n";
            }
        }
        return buf + pre + colors.fg.green + "}" + colors.reset;
    }
}

module.exports = {
    Module: Module,
    Stub: Stub
};