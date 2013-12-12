build:
	@component install --dev
	@component build --dev

test:
	@component test phantom

.PHONY: build