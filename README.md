# Project Structure


	•	web-mini-game-stand/
	•	├─ docker-compose.yml
	•	├─ README.md
	•	├─ .env
	•	├─ api/
	•	│  ├─ Dockerfile
	•	│  ├─ requirements.txt
	•	│  └─ app/
	•	│     └─ main.py
	•	├─ frontend/
	•	│  ├─ Dockerfile
	•	│  ├─ nginx.conf
	•	│  └─ public/
	•	│     ├─ index.html
	•	│     ├─ style.css
	•	│     └─ app.js
	•	└─ db/
	•	   └─ init.sql
---

# Web Mini Game Stand

Тестовый стенд в Docker:

- frontend: Nginx + HTML/CSS/JS мини-игра
- api: FastAPI
- db: PostgreSQL
---

# Операции с проектом
Запуск

	•	docker compose up --build	
Остановка

	•	docker compose down
Полная очистка

	•	docker compose down -v
Адреса

	•	Frontend: http://localhost:8080
	•	API: http://localhost:8000
	•	Swagger: http://localhost:8000/docs
---

# Health checks

Frontend

	•	GET /health
API

	•	GET /health/live
	•	GET /health/ready
	•	GET /health/full
Проверка docker health

	•	docker compose ps

---

# Как запустить

Из корня проекта:

	•	docker compose up --build
Потом открыть:

	•	http://localhost:8080

Быстрая проверка после старта

	•	docker compose ps
	•	curl http://localhost:8080/health
	•	curl http://localhost:8000/health/live
	•	curl http://localhost:8000/health/ready
	•	curl http://localhost:8000/health/full
	•	curl http://localhost:8000/scores

---
# Что здесь реализовано 
“Cистема Healthcheack” с проверками:

	•	frontend healthcheck через Docker
	•	api healthcheck через Docker
	•	db healthcheck через Docker
frontend endpoint:

	•	GET /health
backend endpoints:

	•	GET /health/live
	•	GET /health/ready
	•	GET /health/full
зависимость запуска:

	•	db должен стать healthy
	•	потом стартует api
	•	потом стартует frontend

---
# Как играть в мини-игру
	•	вводишь имя
	•	нажимаешь старт
	•	20 секунд кликаешь по красной цели
	•	результат отправляется в API
	•	API сохраняет счёт в PostgreSQL
	•	справа отображается лидерборд
