.PHONY: start build down

start:
	docker compose up --wait -d

build:
	docker compose up --build --wait -d

down: 
	docker compose down

front:
	docker compose up -d frontend

back:
	docker compose up --wait -d backend db pgadmin