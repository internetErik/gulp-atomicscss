module.exports = (function emmetWrapper() {
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

	wrapper.getStyle = function getStyle(style) {
		return (typeof style === 'string') ? emmet.expandAbbreviation(style, 'css') : handleMultipleArgumentExpand(style);
	};

	return wrapper;
})();