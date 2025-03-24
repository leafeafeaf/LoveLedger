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

        stage('Build Docker Image') {
            steps {
                sh '''
                    export HOME=/home/ubuntu/jenkins
                    export DOCKER_CONFIG=/home/ubuntu/jenkins/.docker
                    mkdir -p $DOCKER_CONFIG
                    
                    docker build --build-arg HOME=$HOME -t loveledger-backend -f backend/Dockerfile .
                '''
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                    docker stop loveledger-backend || true
                    docker rm loveledger-backend || true

                    docker run -d --name loveledger-backend --env-file .env --network mynetwork -p 8080:8080 loveledger-backend
                '''
            }
        }
    }
}
