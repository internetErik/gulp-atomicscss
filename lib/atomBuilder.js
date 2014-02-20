var _ = require("lodash"),
	emmetWrapper = require("./emmetWrapper");

function Atom(c) {

	var atom = {
		className: c,
		mediaQuery: '',
		pseudo: '',
		style: []
	};

	var parts = [],
		pseudoResults = [];

	function stripMediaQuery(){
		if(c.substr(0,2) === 'mq') {
			atom.mediaQuery = '$' + parts[0].substr(2);
			parts = parts.slice(1);
		}
	}

	function stripPseudoElements() {
		var pse = [];

		parts = parts.filter(function (ele, ndx, arr) {
			if(ndx > 0 && arr[ndx-1] === 'pse'){
				pse.push(ele)
				return false;
			}
			else if(ele === 'pse') {
				return false;
			}
			return true;
		});

		atom.pseudo = (pse.length > 0) ? ":" + pse.join(':') : "";
	}

	parts = c.split('-');

	if(parts.length > 1){
		stripMediaQuery();
		stripPseudoElements();
	}
	else parts = parts[0];

	atom.style = emmetWrapper.getStyle(parts);

	return atom;
}

/************************************************************************
*/
function Molecule(classes) {
	var molecule = {
		className: '',
		atoms: [],
		pseudoTypes: [],
		mediaQueries: []
	};

	function stripMoleculeName() {
		molecule.className = _.remove(classes, function (name){
			return name[0] === '_';
		})[0];
	}

	function getAtoms() {
		molecule.atoms = classes.map(function (atom) { return Atom(atom); });
	}

	function getPseudoClassNames() {
		molecule.atoms.map(function (atom){ 
			if(atom.pseudo !== '' && !_.contains(molecule.pseudoTypes, atom.pseudo)){
				molecule.pseudoTypes.push(atom.pseudo);
			}
		});
	}

	function getMediaQueries() {
		molecule.atoms.map(function (atom){ 
			if(atom.mediaQuery !== '' && !_.contains(molecule.mediaQueries, atom.mediaQuery)){
				molecule.mediaQueries.push(atom.mediaQuery);
			}
		});
	}

	stripMoleculeName()
	getAtoms();
	getPseudoClassNames();
	getMediaQueries();

	return molecule;
}

module.exports = (function atomBuilder() {
	var builder = {};

	builder.buildAtoms = function buildAtoms(atoms) {
		return atoms.map(function (atom) { return Atom(atom); });
	}

	builder.buildMolecules = function buildMolecules(molecules) {
		var names = [];

		molecules = molecules.map(function (molecule) { return Molecule(molecule); });

		return molecules;
	}

	return builder;
})();