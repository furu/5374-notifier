run:
	docker run --rm -v $(shell pwd)/app:/app --env-file .env tfrkd/5374-notifier

.PHONY: run
