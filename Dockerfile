FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN DATABASE_URL=sqlite:///tmp/build.db \
    SECRET_KEY=build-only-secret \
    python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "fisilti.wsgi:application", "--bind", "0.0.0.0:$PORT", "--workers", "2", "--timeout", "120"]
