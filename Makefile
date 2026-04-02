dist/index.js: index.js
	./node_modules/.bin/ncc build index.js -o dist \
	  -e @actions/core -e @actions/glob
