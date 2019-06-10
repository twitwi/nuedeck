
SASSOPTS=--scss --style expanded

D=build

all:
	make _fontbox.scss
	make theme-variations
	make sass-generate

clean:
	cd ${D} && rm -f *.scss *.css *.css.map

custom:
	make _fontbox.scss
	make sass-generate

sass-generate:
	cp -t ${D} _*.scss
	cd ${D} && sass --update ${SASSOPTS} .

theme-variations: tools/generate-variations.py
	cd ${D} && ../$< all

_fontbox.scss: _fontbox.scss.in tools/get-and-use-local-fonts.py
	mkdir -p fonts
	tools/get-and-use-local-fonts.py $<
	cd ${D} && rm -rf fonts
	mv fonts ${D}

test-continuous:
	bash -l -c '@mo ../public/test.css *.scss tools/* Makefile -- make test'

test: ${D}/test.css
	cp ${D}/test.css ../public/

${D}/test.css: ${D}/test.scss $(wildcard _*.scss) Makefile
	cp -t ${D} _*.scss
	cd ${D} && sass ${SASSOPTS} --update test.scss:test.css

${D}/test.scss: tools/generate-variations.py $(wildcard _*.scss) _fontbox.scss tools/*.py Makefile
	cd ${D} && ../$< ../$@ - light 200 - - -


.PHONY: sass-generate theme-variations
