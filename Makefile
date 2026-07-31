.PHONY: site clean

site: clean
	raco scribble --htmls ++extra filter.js ++extra style.css site.scribl
	cp -r benchmark site/benchmark

clean:
	rm -rf site
