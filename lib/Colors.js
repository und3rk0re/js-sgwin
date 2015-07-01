
var Caps = require("./Capabilities")
    , ansi = require("ansi-256-colors");

exports.reset = Caps.color ? ansi.reset : "";
exports.bold = Caps.color ? "\x1b[1m" : "";
exports.italic = Caps.italic ? "\x1b[3m" : "";
exports.underline = Caps.color ? "\x1b[4m" : "";

exports.fgRgb = function fgRgb(rgb, standard, bright) {
    if (!Caps.color) {
        return "";
    }
    if (rgb && Caps.rgb) {
        return ansi.fg.getRgb(rgb[0], rgb[1], rgb[2]);
    }

    if (typeof bright === "number") {
        return ansi.fg.bright[bright];
    }

    if (typeof standard === "number") {
        return ansi.fg.standard[standard];
    }

    return "";
};
exports.bgRgb = function fgRgb(rgb, standard, bright) {
    if (!Caps.color) {
        return "";
    }
    if (rgb && Caps.rgb) {
        return ansi.bg.getRgb(rgb[0], rgb[1], rgb[2]);
    }

    if (typeof bright === "number") {
        return ansi.bg.bright[bright];
    }

    if (typeof standard === "number") {
        return ansi.bg.standard[standard];
    }

    return "";
};

exports.palette = {
    name: exports.fgRgb([1, 0, 1], null, 0) + exports.italic,
    infoTag: exports.fgRgb([0, 2, 5], null, 4),
    infoMsg: exports.fgRgb([0, 1, 4], null, null),
    warnTag: exports.fgRgb([5, 3, 0], null, 3),
    warnMsg: exports.fgRgb([4, 3, 1], null, 3),
    errTag: exports.fgRgb([5, 0, 1], null, 1),
    errMsg: exports.fgRgb([5, 0, 0], null, 1),
    exceptionGraph: exports.fgRgb([4, 3, 1], null, null),
    exceptionMsg: exports.fgRgb([5, 3, 0], null, 1) + exports.bold,
    exceptionFunc: exports.fgRgb([4, 3, 1], null, null),
    exceptionLine: exports.fgRgb([0, 4, 5], null, null),
    successTag: exports.fgRgb([0, 5, 0], null, 2),
    successMsg: exports.fgRgb([0, 4, 1], null, 2),
    outTag: exports.fgRgb([0, 4, 5], 6, null),
    outMsg: exports.fgRgb([0, 4, 5], null, null),
    inTag: exports.fgRgb([0, 4, 2], null, 6),
    inMsg: exports.fgRgb([0, 4, 2], null, null),

    typeInt: exports.fgRgb([0, 2, 4], null, 2) + exports.bold,
    typeUndef: exports.fgRgb(null, null, 7) + exports.bold,
    typeSpecial: exports.fgRgb([5, 1, 3], null, 5),
    typeString: exports.fgRgb([3, 5, 1], null, 2) + exports.bold
};

exports.showcase = function showcase() {
    console.log("Registered palette");
    for (var name in exports.palette) {
        console.log(name + "\t" + exports.palette[name] + " ◼ Example" + exports.reset);
    }

    for (var i=0; i < 8; i ++) {
        console.log(" #" + i + ansi.fg.bright[i] + " ◼◼◼" + ansi.fg.standard[i] + " ◼◼◼" + ansi.reset);
    }

    for (var r = 0; r < 6; r ++) {
        for (var g = 0; g < 6; g ++) {
            for (var b = 0; b < 6; b ++) {
                if (b == 0) {
                    process.stdout.write(" ");
                }
                var rgb = ansi.fg.getRgb(r, g, b);

                process.stdout.write(rgb + " ◼" + ansi.reset);
            }
        }
        process.stdout.write("\n");
    }

    console.log("");
};