# Root variables
PACKAGES := packages/core packages/react-sdk packages/vue-sdk packages/native-sdk

.PHONY: install clean build publish test lint

install:
	pnpm install

clean:
	rm -rf $(PACKAGES:%=%/dist)

build:
	for pkg in $(PACKAGES); do \
		echo "Building $$pkg..."; \
		pnpm --filter "$$pkg" run build; \
	done

publish:
	for pkg in $(PACKAGES); do \
		echo "Publishing $$pkg..."; \
		cd $$pkg && npm publish --access public; \
		cd -; \
	done

test:
	pnpm test

lint:
	pnpm lint
