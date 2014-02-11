# gulp-atomicscss

> atomicscss plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-atomicscss` as a development dependency:

```shell
npm install --save-dev gulp-atomiccsss
```

Sample `gulpfile.js`:

```javascript
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	atomic = require('atomicscss'),
	concat = require('gulp-concat'),
	sass = require ('gulp-sass'),
	stream;


gulp.task('atomic', function() {
	return gulp.src('files/*.html')
			.pipe(concat('_atomic.scss'))
			.pipe(atomic())
		  	.pipe(gulp.dest('scss/_atomic.scss'));
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

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
