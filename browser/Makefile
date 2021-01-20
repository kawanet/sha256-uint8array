#!/usr/bin/env bash -c make

all: dist test

dist: ../dist/sha256-uint8array.min.js

../dist/sha256-uint8array.min.js: ../build/bundle.js
	../node_modules/.bin/terser -c -m --mangle-props "regex=/^_/" --ecma 5 -o $@ $<

../build/bundle.js: ../build/lib/sha256-uint8array.js
	echo 'var SHA256 = ("undefined" !== typeof exports ? exports : {});' > $@
	echo '!(function(exports) {' >> $@
	cat $< >> $@
	echo '})(SHA256)' >> $@
	perl -i -pe 's#^("use strict"|Object.defineProperty|exports.*= void 0)#// $$&#' $@

# ES5
test-es5: dist ../build/lib/sha256-uint8array.js
	cp ../package.json ../build
	[ -d ../build/dist ] || ln -s ../dist ../build
	../node_modules/.bin/browserify -o ../build/test.js ../build/test/*.js

../build/lib/sha256-uint8array.js: ../lib/*.ts ../test/*.ts
	../node_modules/.bin/tsc -p ../browser

# ES2018
test: dist ../lib/sha256-uint8array.js
	../node_modules/.bin/browserify -o ../build/test.js ../test/*.js

../lib/sha256-uint8array.js: ../lib/*.ts ../test/*.ts
	../node_modules/.bin/tsc -p ..

clean:
	/bin/rm -fr ../build ../dist/*.js ../lib/*.js ../test/*.js

.PHONY: all clean test
