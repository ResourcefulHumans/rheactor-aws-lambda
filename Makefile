dist: src/*.js
	./node_modules/.bin/babel src -d dist

clean:
	rm -rf dist
