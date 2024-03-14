
all: build
.PHONY: build

build:
	dart compile js -O2 -opublic/js/main.js src/web/main.dart

run:
	@tools/watch.sh

serve:
	cd src && webdev serve --auto restart --debug
