.PHONY: site clean

site: clean
	raco scribble --htmls ++extra filter.js ++extra style.css ++extra zip.js ++extra preview.js site.scribl
	cp -r benchmark site/benchmark

clean:
	rm -rf site
