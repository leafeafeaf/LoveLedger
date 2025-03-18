pipeline {
    agent any
    environment {
        GRADLE_USER_HOME = "/home/ubuntu/jenkins/.gradle"
    }
    stages {
        stage('Secrets Setup') {
            steps {
                withCredentials([
                     file(credentialsId: 'env-file', variable: 'EnvFile'),
                ]) {
                    sh '''
                        cp "$EnvFile" .env
                        chmod 644 .env
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    cd ./backend

                    chmod +x ./gradlew

                    # Gradle 빌드 시 테스트 스킵 (-x test)
                    # 데몬 비활성화 (--no-daemon)
                    ./gradlew clean build -x test --no-daemon
                '''
            }
        }

        stage('Stop Existing Backend') {
            steps {
                sh '''
                    cd ./backend

                    # 기존에 실행 중인 애플리케이션 종료
                    if [ -f backend.pid ]; then
                        kill $(cat backend.pid) || true
                        rm backend.pid
                    fi
                '''
            }
        }

        stage('Run Backend') {
            steps {
                sh '''
                    cd ./backend/build/libs

                    chmod +x *.jar  # JAR 파일 실행 권한 부여

                    # 실행할 JAR 파일 찾기 (plain이 없는 JAR 선택)
                    JAR_FILE=$(ls | grep -E '.*\.jar' | grep -v 'plain' | head -n 1)

                    if [ -z "$JAR_FILE" ]; then
                        echo "ERROR: 실행할 JAR 파일을 찾을 수 없습니다!"
                        exit 1
                    fi

                    # 백그라운드 실행 및 로그 저장
                    nohup java -jar "$JAR_FILE" 1>output.log 2>error.log &

                    echo $! > ../../backend.pid  # PID 저장
                '''
            }
        }
    }
}
