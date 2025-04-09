# Python 3.11 기반 슬림 이미지
FROM python:3.11-buster

# 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    build-essential \
    && apt-get clean

# 루트 작업 디렉토리
WORKDIR /app

# 전체 프로젝트 복사
COPY . /app

# 의존성 설치
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# fastapi 폴더로 이동
WORKDIR /app/fastapi

# 포트 오픈
EXPOSE 8000

# FastAPI 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
