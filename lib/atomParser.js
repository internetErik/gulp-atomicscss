/************************************************************************
*/
module.exports = (function atomParser() {
	var parser = {};

	function parseClassesFromAttribute(line) {
		//'class="a b c d"' => ['a','b','c','d'] 
		return line.split('"')[1].split(' ').filter(function (style){ return (style !== '' && style !== ' '); });
	}

	function filterDuplicateMolecules(atoms) {
		var memo = [];

		return atoms.filter(function (list){ 
			var name;
			
			//if there are no other classes, filter this out
			if(list.length === 1) 
				return false;

			name = list.filter(function (ele) { return ele.indexOf('_') > -1; });

			if(memo.includes(name[0])) {
				return false;
			}
			else {
				memo.push(name[0]);
				return true;
			}
		});
	}

	parser.parseFile = function parseFile(file) {
		return file.match(/class[ \t]*=[ \t]*"[^"]+" */g);
	}

	parser.getAtoms = function getAtoms(atomArray) {
		var atoms = [],
			i;

		for(i = 0; i < atomArray.length; i += 1) {
			atoms = atoms.concat(parseClassesFromAttribute(atomArray[i]));
		}

		return [...new Set(atoms)].sort();
	}

	parser.getMolecules = function getMolecules(moleculeArray) {
		var atoms = [],
			molecules = [],
			start = -1;

		atoms = moleculeArray
				.filter(function (ele) { return (ele.indexOf(' _') > -1 || ele.indexOf('"_') > -1); })
				.map(parseClassesFromAttribute)
				.filter(function (molecule){ return molecule.length > 1 });
		
		atoms.map(function (molecule){
			start = -1;
			molecule.map(function (atom, i){
				if((atom[0] === '_' && start !== -1) || i === molecule.length-1 ) {
					molecules.push( 
							(i === molecule.length-1) ? 
								molecule.slice(start) : 
								molecule.slice(start, i) 
							);
					start = i;
				}
				else if(atom[0] === '_'){
					start = i;
				}
			});
		});
		
		//filter duplicates
		return filterDuplicateMolecules(molecules);
	}

	return parser;
})();