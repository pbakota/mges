
all: build
.PHONY: build

build:
	dart compile js -O0 -opublic/js/main.js src/main.dart

run:
	@tools/watch.sh

serve:
	php -S 127.0.0.1:8000 -t public

