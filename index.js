var through = require("through2"),
	PluginError = require('plugin-error');,
	atomic = require("./lib/atomicscss");

module.exports = function () {
	"use strict";
	
	function atomicCss(file, enc, callback) {
		var contents,
			that = this;

		function parseFiles(files) {
			atomic.parseAllFiles(files, createCss);
		}

		function createCss(atoms, molecules) {
			atomic.createFileText(atoms, molecules, function(css) {
				file.contents = new Buffer(css);

				that.push(file);
			});
		}

		// Do nothing if no contents
		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit("error",
				new PluginError("gulp-atomicCss", "Stream content is not supported"));
			return callback();
		}

		if (file.isBuffer()) {
			contents = file.contents.toString('utf8');

			parseFiles([contents]);
		}

		return callback();
	}

	return through.obj(atomicCss);
};
