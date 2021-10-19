module.exports = (function cssBuilder() {
	var builder = {};

	function wrapInMediaQuery(css, mediaQuery) {
		return '@media #{' + mediaQuery + '} {\n' + css + '\n}';
	}

	function toCssClass(className, pseudo, style) {
		return "." + className + (pseudo ? pseudo : "") + " { " + style + " }";
	}

	function atomsToCss(className, atoms, pseudo) {
		atoms = atoms.reduce(function (p, c) { return p + c.style + '\n'; }, '\n');
		return toCssClass(className, pseudo, atoms) + '\n';
	}

	function makePseudoAtomList(pseudo, atoms){
		return {
			pseudo: pseudo,
			atoms: atoms.filter(atom => atom.pseudo === pseudo)
		};
	}

	builder.generateAtomCss = function generateAtomCss(atom) {
		var css = toCssClass(atom.className, atom.pseudo, atom.style);

		if(atom.mediaQuery !== '') {
			css = wrapInMediaQuery(css, atom.mediaQuery);
		}

		return css;
	}

	builder.generateMoleculeCss = function generateMoleculeCss(molecule) {
		var css = '',
			atoms = [],
			pseudoAtoms = [],
			mediaAtoms = [];

	//create css for atoms that have no pseudo-class or media query
		atoms = molecule.atoms.filter(function (atom){
			return (atom.pseudo === '' && atom.mediaQuery === '');
		});

		css = atomsToCss(molecule.className, atoms, '') + '\n';

	//create css for atoms that have pseudo classes
		//create array of objects { pseudo, atoms }
		molecule.pseudoTypes.map(function (pseudo){
			pseudoAtoms.push(makePseudoAtomList(pseudo, molecule.atoms));
		});

		pseudoAtoms.map(function (obj){
			css += atomsToCss(molecule.className, obj.atoms, obj.pseudo) + '\n';
		});

	//create css for atoms that have media queries and pseudo classes that are in media queries
		//create array of objects { mediaQuery, pseudoTypes, atoms }
		molecule.mediaQueries.map(function (mediaQuery) {
			mediaAtoms.push({
				mediaQuery: mediaQuery,
				pseudoAtoms: [],
				atoms: molecule.atoms.filter(atom => atom.mediaQuery === mediaQuery ),
			});
		});

		//create sub-arrays of atoms paired with psuedo class names
		mediaAtoms.map(function (obj){
			var memo = [];
			obj.pseudoAtoms = [];

			obj.atoms.map(function (atom){
				if(!memo.includes(atom.pseudo) && atom.pseudo !== '') {
					memo.push(atom.pseudo);
					obj.pseudoAtoms.push(makePseudoAtomList(atom.pseudo, obj.atoms));
				}
			});
		});

		//generate css
		mediaAtoms.map(function (obj){
			mediaAtoms = obj.atoms.reduce(function (p, c) { return p + c.style + '\n'; }, '\n');
			css += wrapInMediaQuery(toCssClass(molecule.className, '' , mediaAtoms), obj.mediaQuery) + '\n';
		
			obj.pseudoAtoms.map(function (pseObj){
				css += wrapInMediaQuery(atomsToCss(molecule.className, pseObj.atoms, pseObj.pseudo), obj.mediaQuery) + '\n';
			});
		});

		return css;
	}

	return builder;
})();
