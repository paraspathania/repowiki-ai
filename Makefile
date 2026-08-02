.PHONY: dev build down migrate test lint clean

dev:
	docker-compose up --build

down:
	docker-compose down

migrate:
	cd backend && alembic upgrade head

test:
	cd backend && pytest
	cd frontend && npm test

lint:
	cd backend && ruff check .
	cd frontend && npm run lint

clean:
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} +
