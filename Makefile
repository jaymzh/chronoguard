dist/index.js: index.js
	# we externalize the Actions toolkit because NCC
	# chokes on the imports
	./node_modules/.bin/ncc build index.js -o dist \
		-e @actions/core -e @actions/glob
