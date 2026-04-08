# Web Mini Game Stand

Тестовый стенд в Docker:
- frontend: Nginx + HTML/CSS/JS мини-игра
- api: FastAPI
- db: PostgreSQL

## Запуск

``bash
docker compose up --build

Адреса
	•	Frontend: http://localhost:8080
	•	API: http://localhost:8000
	•	Swagger: http://localhost:8000/docs

Health checks

Frontend
	•	GET /health

API
	•	GET /health/live
	•	GET /health/ready
	•	GET /health/full

Проверка docker health
docker compose ps

Остановка
docker compose down

Полная очистка
docker compose down -v

---
