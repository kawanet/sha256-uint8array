#!/usr/bin/env bash -c make

all: ../dist/sha256-uint8array.min.js ../build/test.js

../dist/sha256-uint8array.min.js: ../build/sha256-uint8array.browser.js
	../node_modules/.bin/terser -c -m --mangle-props "regex=/^_/" --ecma 5 -o $@ $<

../build/sha256-uint8array.browser.js: ../build/sha256-uint8array.js
	echo 'var SHA256 = ("undefined" !== typeof exports ? exports : {});' > $@
	echo '!(function(exports) {' >> $@
	cat $< >> $@
	echo '})(SHA256)' >> $@
	perl -i -pe 's#^("use strict"|Object.defineProperty|exports.*= void 0)#// $$&#' $@

../build/sha256-uint8array.js: ../lib/*.ts
	../node_modules/.bin/tsc -p ../browser

../build/test.js: ../lib/*.ts ../test/*.ts
	../node_modules/.bin/tsc -p ..
	../node_modules/.bin/browserify -o $@ ../test/*.js

clean:
	/bin/rm -fr ../build dist/*.js

test: all
	open ../browser/test.html

.PHONY: all clean test
