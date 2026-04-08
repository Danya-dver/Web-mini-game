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

Как запустить

Из корня проекта:
docker compose up --build
Потом открыть:
http://localhost:8080

Что здесь реализовано

Есть вся “система” с проверками:

	•	frontend healthcheck через Docker
	•	api healthcheck через Docker
	•	db healthcheck через Docker
	•	frontend endpoint:
	•	GET /health
	•	backend endpoints:
	•	GET /health/live
	•	GET /health/ready
	•	GET /health/full
	•	зависимость запуска:
	•	db должен стать healthy
	•	потом стартует api
	•	потом стартует frontend


Быстрая проверка после старта

docker compose ps
curl http://localhost:8080/health
curl http://localhost:8000/health/live
curl http://localhost:8000/health/ready
curl http://localhost:8000/health/full
curl http://localhost:8000/scores

Что делает мини-игра
	•	вводишь имя
	•	нажимаешь старт
	•	20 секунд кликаешь по красной цели
	•	результат отправляется в API
	•	API сохраняет счёт в PostgreSQL
	•	справа отображается лидерборд
