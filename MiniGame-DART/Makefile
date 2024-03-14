
all: build
.PHONY: build

build:
	dart compile js -O0 -opublic/js/main.js src/main.dart

run:
	@tools/watch.sh

serve:
	cd src && webdev serve --auto restart --debug
