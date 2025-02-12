.PHONY: start build down front back

start:
	docker compose up --wait -d

build:
	docker compose up --build --wait -d

down: 
	docker compose down

front:
	docker compose up -d frontend-mindcare

back:
	docker compose up --wait -d backend-mindcare db-mindcare pgadmin-mindcare grafana-mindcare