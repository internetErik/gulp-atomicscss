var atomParser = require("./atomParser"),
	atomBuilder = require("./atomBuilder"),
	cssBuilder = require("./cssBuilder");

module.exports = (function atomicScss() {

	var as = {};

	as.parseAllFiles = function parseAllFiles(files, callback) {
		var parsed = [],
			atoms = [],
			molecules = [],
			i;

		parsed = files.map(function (file) { return atomParser.parseFile(file); });

		for(i = 0; i < parsed.length; i += 1) {
			atoms = [...new Set(atoms.concat(atomParser.getAtoms(parsed[i])))];
			molecules = [...new Set(molecules.concat(atomParser.getMolecules(parsed[i])))];
		}

		//filter out things we should ignore
		atoms = atoms.filter(function (ele) { return (ele[0] !== '-' && ele[0] !=='_' && ele !== ' ' && ele !== ''); })
		atoms = atomBuilder.buildAtoms(atoms);

		molecules = atomBuilder.buildMolecules(molecules);

		callback(atoms, molecules);
	}

	as.createFileText = function createFileText(atoms, molecules, callback) {
		var css = "";

		css = atoms.reduce((acc, c) =>`${acc}${cssBuilder.generateAtomCss(c)}\n`, '');

		molecules.map(function (molecule){
			css += cssBuilder.generateMoleculeCss(molecule); 
		});

		callback(css);
	}

	return as;

})();