# 1. 베이스 이미지 (JDK 17)
FROM eclipse-temurin:17-jdk-alpine

# 2. 타임존 설정 (선택)
ENV TZ=Asia/Seoul

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 빌드된 jar 파일 복사
COPY build/libs/*.jar app.jar

# 5. 실행
ENTRYPOINT ["java", "-jar", "app.jar"]