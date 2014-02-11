var fs  = require("fs"),
	_ = require("lodash"),
	async = require('async');

module.exports = (function () {

/************************************************************************
*/
	var emmetWrapper = (function() {
		var emmet = require('./emmet-core/emmet'),
			wrapper = {};

		function extentionMapper(ele, ndx, arr) {
			var start = '',
				end = '';

			/*************************************************
				Variables
					xxx-vxxx -> xxx-vxxx { xxx: $xxx; }
				Dots '.'
					xxx-xxxpxxx -> xxx-xxxpxxx { xxx: xxx.xxx; }
				Percentage
					xxx-xyyy	-> xxx-xyyy { xxx: yyy%; }
				pseudo classes
					xxx-pse-after  -> .xxx-yyy-pse-after:after { xxx: yyy;}

				? Element relations (ul:hover li)
			*/

			if (ele ==='pse') {
				ele = '';
				arr[ndx+1] = '';
			}

			if(ele[0] === 'p')
				start = '.';
			else if(ele[0] === 'v')
				start = '$';
			else if(ele[0] === 'c')
				start = '#';
			else if(ele[0] === 'x') {
				end = '%';
				ele = ele.replace('p','.');
			}
			return (start === '' && end === '') ? ele : start + ele.substr(1) + end;
		}

		function handleMultipleArgumentExpand(parts) {
			var style = '';

			style = emmet.expandAbbreviation(parts[0], 'css').split(':')[0];
			style = style + ": " + parts.slice(1).map(extentionMapper).join(' ') + ';';

			return style;
		}

		wrapper.getStyle = function(style) {
			return (typeof style === 'string') ? emmet.expandAbbreviation(style, 'css') : handleMultipleArgumentExpand(style);
		};

		return wrapper;
	})();

/************************************************************************
*/
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

			parts = parts.filter(function(ele, ndx, arr) {
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
			molecule.className = _.remove(classes, function(name){
				return name[0] === '_';
			})[0];
		}

		function getAtoms() {
			molecule.atoms = classes.map(function(atom) { return Atom(atom); });
		}

		function getPseudoClassNames() {
			molecule.atoms.map(function(atom){ 
				if(atom.pseudo !== '' && !_.contains(molecule.pseudoTypes, atom.pseudo)){
					molecule.pseudoTypes.push(atom.pseudo);
				}
			});
		}

		function getMediaQueries() {
			molecule.atoms.map(function(atom){ 
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

/************************************************************************
*/
	var atomParser = (function() {
		var parser = {};

		function parseClassesFromAttribute(line) {
			//'class="a b c d"' => ['a','b','c','d'] 
			return line.split('"')[1].split(' ');
		}

		function filterDuplicateMolecules(atoms) {
			var memo = [];

			return atoms.filter(function(list){ 
				var name = list.filter(function(ele) { return ele.indexOf('_') > -1; });

				if(_.contains(memo, name[0])) {
					return false;
				}
				else {
					memo.push(name[0]);
					return true;
				}
			});
		}

		parser.parseFile = function(file) {
			return file.match(/class[ \t]*=[ \t]*"[^"]+" */g);
		}

		parser.getAtoms = function(atomArray) {
			var atoms = [],
				i;

			for(i = 0; i < atomArray.length; i += 1) {
				atoms = atoms.concat(parseClassesFromAttribute(atomArray[i]));
			}

			return _.uniq(atoms).sort();
		}

		parser.getMolecules = function(moleculeArray) {
			var atoms = [],
				molecules = [];

			atoms = moleculeArray.filter(function (ele) { return (ele.indexOf(' _') > -1 || ele.indexOf('"_') > -1); });

			//find definitions only - _class mixed in with other atoms
			atoms.filter(function(ele) { 
				var ar = parseClassesFromAttribute(ele);
				if (ar.length > 1)
					molecules.push(ar);
			});

			//filter duplicates
			return filterDuplicateMolecules(molecules);
		}

		return parser;
	})();

/************************************************************************
*/
	var atomBuilder = (function() {
		var builder = {};

		builder.buildAtoms = function(atoms) {
			return atoms.map(function(atom) { return Atom(atom); });
		}

		builder.buildMolecules = function(molecules) {
			var names = [];

			molecules = molecules.map(function(molecule) { return Molecule(molecule); });

			return molecules;
		}

		return builder;
	})();

/************************************************************************
*/
	var cssBuilder = (function() {
		var builder = {};

		function wrapInMediaQuery(css, mediaQuery) {
			return '@media #{' + mediaQuery + '} {\n' + css + '\n}';
		}

		function toCssClass(className, pseudo, style) {
			return "." + className + (pseudo ? pseudo : "") + " { " + style + " }";
		}

		function atomsToCss(className, atoms, pseudo) {
			atoms = atoms.reduce(function(p, c) { return p + c.style + '\n'; }, '\n');
			return toCssClass(className, pseudo, atoms) + '\n';
		}

		function makePseudoAtomList(pseudo, atoms){
			return {
				pseudo: pseudo,
				atoms: _.where(atoms, { pseudo : pseudo })
			};
		}

		builder.generateAtomCss = function(atom) {
			var css = toCssClass(atom.className, atom.pseudo, atom.style);

			if(atom.mediaQuery !== '') {
				css = wrapInMediaQuery(css, atom.mediaQuery);
			}

			return css;
		}

		builder.generateMoleculeCss = function(molecule) {
			var css = '',
				atoms = [],
				pseudoAtoms = [],
				mediaAtoms = [];

			//create css for atoms that have no pseudo-class or media query
			atoms = molecule.atoms.filter(function(atom){
				return (atom.pseudo === '' && atom.mediaQuery === '');
			});

			css = atomsToCss(molecule.className, atoms, '') + '\n';

			//create array of objects { pseudo, atoms }
			molecule.pseudoTypes.map(function(pseudo){
				pseudoAtoms.push(makePseudoAtomList(pseudo, molecule.atoms));
			});

			pseudoAtoms.map(function(obj){
				css += atomsToCss(molecule.className, obj.atoms, obj.pseudo) + '\n';
			});

			//create array of objects { mediaQuery, pseudoTypes, atoms }
			molecule.mediaQueries.map(function(mediaQuery) {
				mediaAtoms.push({
					mediaQuery: mediaQuery,
					pseudoAtoms: [],
					atoms: _.where(molecule.atoms, { mediaQuery : mediaQuery })
				});
			});

			// //create sub-arrays of atoms paired with psuedo class names
			mediaAtoms.map(function(obj){
				var memo = [];
				obj.pseudoAtoms = [];

				obj.atoms.map(function(atom){
					if(!_.contains(memo, atom.pseudo) && atom.pseudo !== '') {
						memo.push(atom.pseudo);
						obj.pseudoAtoms.push(makePseudoAtomList(atom.pseudo, obj.atoms));
					}
				});
			});

			//generate css
			mediaAtoms.map(function(obj){
				mediaAtoms = obj.atoms.reduce(function(p, c) { return p + c.style + '\n'; }, '\n');
				css += wrapInMediaQuery(toCssClass(molecule.className, '' , mediaAtoms), obj.mediaQuery) + '\n';
			
				obj.pseudoAtoms.map(function(pseObj){
					css += wrapInMediaQuery(atomsToCss(molecule.className, pseObj.atoms, pseObj.pseudo), obj.mediaQuery) + '\n';
				});
			});

			return css;
		}

		return builder;
	})();

/************************************************************************
*/
	function readAsync(file, callback) {
	    fs.readFile(file, 'utf8', callback);
	}

	function parseAllFiles(files, callback) {
		var parsed = [],
			atoms = [],
			molecules = [],
			i;

		parsed = files.map(function(file) { return atomParser.parseFile(file); });

		for(i = 0; i < parsed.length; i += 1) {
			atoms = _.union(atoms, atomParser.getAtoms(parsed[i]));
			molecules = _.union(molecules, atomParser.getMolecules(parsed[i]));
		}

		//filter out things we should ignore
		atoms = atoms.filter(function(ele) { return (ele[0] !== '-' && ele[0] !=='_' && ele !== ' ' && ele !== ''); })
		atoms = atomBuilder.buildAtoms(atoms);

		molecules = atomBuilder.buildMolecules(molecules);

		callback(atoms, molecules);
	}

	function createFileText(atoms, molecules, callback) {
		var css = "";

		css = atoms.reduce(function(p, c) { return p + cssBuilder.generateAtomCss(c) + '\n'; }, '');

		molecules.map(function(molecule){
			css += cssBuilder.generateMoleculeCss(molecule); 
		});

		callback(css);
	}

	function writeAtoms(file, text) {
		fs.writeFile(file, text, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("Saved file " + file);
		    }
		});
	}


	function readAllFiles(files, callback) {
		async.map(files, readAsync, function(err, results) {
		    callback(results);
		});
	}

	function getFileList(dir, callback) {
		var walk    = require('walk'),
			files   = [];

		// Walker options
		var walker  = walk.walk(dir, { followLinks: false });

		walker.on('file', function(root, stat, next) {
		    files.push(root + '/' + stat.name);
		    next();
		});

		walker.on('end', function() { callback(files); });
	}

	return {
		getFileList: getFileList,
		readAllFiles: readAllFiles,
		parseAllFiles: parseAllFiles,
		createFileText: createFileText,
		writeAtoms: writeAtoms
	};

})();