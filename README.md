# gulp-atomicscss

> atomicscss plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-atomicscss` as a development dependency:

```shell
npm install --save-dev gulp-atomiccsss
```

## Class Attribute

###Write class names as emmet css abbreviations.

*syntax:* `<emmet>`

*example:* `class="dib"` => `.dib { display: inline-block; }`

###Use colors

*syntax:* `<emmet>-c<hex>`

*example:* `class="c-cf00"` => `.c-cf00 { color: #f00; }`

###Use SCSS variables

*syntax:* `<emmet>-v<var name>`

*example:* `class="c-vColor1"` => `.c-vColor1 { color: $Color1; }`

###Multi-part settings

*syntax:* `<emmet>-<val>-<val>-<val>`

*example:* `class="m-10px-5px-0px-5px"` => `.m-10px-5px-0px-5px { margin: 10px 5px 0px 5px; }`

###Using a dot ‘.’

*syntax:* `<emmet>-p<num>`

*syntax:* `<emmet>-<num>p<num>`

*example:* `class="fz-p5em"` => `.fz-p5em { font-size: .5em; }`

*example:* `class="fz-2p5em"` => `.fz-2p5em { font-size: 2.5em; }`

###Percentages
*syntax:* `<emmet>-x<num>`

*example:* `class="w-x50"` => `.w-x50 { width: 50%; }`

*example:* `class="w-x12p5"` => `.w-x12p5 { width: 12.5%; }`

###Pseudo classes

*syntax:* `<emmet>-pse-<pseudo>`

*example:* `class="c-pse-hover-cf00"` => `.c-pse-hover-cf00:hover { color: #f00; }`

###Media Queries

*syntax:* `mq<sass-variable>-<emmet>` => `@media #{$<sass-variable>} { <emmet-generated-sass> }`

*example:* 

`class="bgc-cf00 mqmobile-bgc-c000"` => 

style.scss
```scss
$mobile: "(max-width: 550px)";
@import "atomic"
```

_atomic.scss
```scss
.bgc-cf00 { background-color: #f00; } 
@media (max-width: 550px) { .bgc-c000 { background-color: #000; }}
```

###Molecules - groups atomic classes together for re-use

*syntax:* `_<className> <emmet> <emmet> <emmet>`
*example:* `class="_link1 c-cf00 dib lh-25px"` => 

_atomic.scss
```scss
._link1 { 
  color: #f00; 
  display: inline-block; 
  line-height: 25px; }
```

*example:* `class="_color c-cf00 _link dib lh-25px"` => 

_atomic.scss
```scss 
._color { 
  color: #f00; } 
._link1 { 
  display: inline-block; 
  line-height: 25px; }
```

###Escaping SCSS generation

*syntax:* `-<Classname>`

*example:* `-ignoreThis` => 


## Getting Started with a Sample Project

Create a folder called files, and create a file in it called `index.html`

```html
<!doctype html>
<html>
<head>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="dib">Hello World</div>
</body>
</html>
```

Create a Folder called scss and create a file in it called `style.scss`:

```scss
@import "atomic";
```

Create the following file `gulpfile.js`:

```javascript
var gulp = require('gulp'),
    atomic = require('gulp-atomicscss'),
    concat = require('gulp-concat'),
    sass = require ('gulp-sass');

gulp.task('atomic', function() {
    return gulp.src('files/*.html')
        .pipe(concat('_atomic.scss'))
        .pipe(atomic())
	.pipe(gulp.dest('scss/'));
});

gulp.task('sass', ['atomic'], function () {	
    gulp.src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('css/'));
});

gulp.task('default', ['sass']);

gulp.task('watch', function() {
    gulp.watch(['files/*.html', 'scss/*.scss'], function(event) {
        gulp.start('default');
    });
});
```

For this gulpfile to work you will need to use the following commands:

```
npm install gulp
npm install gulp-atomicscss
npm install gulp-concat
npm install gulp-sass
```

You should now have the following directory structure:

```
files/
 |- index.html
scss
 |- style.scss
node-modules
 |- < . . . >
gulpfile.js
```

now run the command `gulp`, and the following files will be created:

```
css/
 |- style.css
scss/_atomic.scss
```

The file `_atomic.scss` should contain the following:

```scss
.dib { display: inline-block; }
```

The file `style.css` should contain the following:

```css
.dib {
    display: inline-block; }
```

## Helpful Links

* http://docs.emmet.io/cheat-sheet/

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
