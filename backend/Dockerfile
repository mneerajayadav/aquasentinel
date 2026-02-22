# AquaSentinel — Backend Dockerfile
# Person 4 owns this file.

FROM python:3.11-slim

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev gcc --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
