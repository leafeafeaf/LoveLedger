
pipeline {
    agent any

    environment {
        CONTAINER_NAME = 'backend'
        DOCKER_IMAGE = 'backend-image:latest'
    }

    stages {
        stage('Prepare Environment') {
            steps {
                //cicd/html 아래 파일 모두 삭제
                sh 'rm -rf ./cicd/html/*'
                sh 'docker system prune -a -f'
            }
        }
        
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
                //백엔드 빌드
                sh '''
                    cd ./backend/Split

                    chmod +x ./gradlew

                    # gradle 빌드 시 테스트 스킵 (-x test)
                    # 데몬 비활성화 (--no-daemon)
                    ./gradlew clean build -x test --no-daemon
                '''
            }
        }
         stage('Build Frontend') {
            steps {
                sh '''
                    cd ./Frontend/spilt_FE/

                    # 의존성 설치 (기존 node_modules 유지)
                    npm ci || npm install

                    # Next.js 빌드 및 정적 변환
                    npm run build
                '''

                //프론트엔드 빌드 파일 cicd/html 아래로 이동
                sh 'cp -r ./Frontend/spilt_FE/dist/* ./cicd/html/'
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                script { 
                    sh 'docker-compose down'
                    sh '''
                        # Bash 사용하도록 변경
                        bash -c '
                            set -a
                            source <(awk -F= "{ gsub(/^[ \\t]+|[ \\t]+$/, \"\", \$2); print \$1 \"=\" \$2 }" .env)
                            set +a
                            echo "Removing image: $BACKEND_IMAGE_NAME"
                            if [ -n "$BACKEND_IMAGE_NAME" ] && docker images -q "$BACKEND_IMAGE_NAME"; then
                                docker rmi "$BACKEND_IMAGE_NAME"
                            else
                                echo "Image not found or variable is empty: $BACKEND_IMAGE_NAME"
                            fi
                        '
                    '''

                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    //메타모스트 연동
    post {
        success {
            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'good', 
                message: "빌드 성공: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)", 
                endpoint: 'https://meeting.ssafy.com/hooks/97gr1wff138tmqum7exwc75h7c', 
                channel: ' B202'
                )
            }
        }
        failure {
            script {
                def Author_ID = sh(script: "git show -s --pretty=%an", returnStdout: true).trim()
                def Author_Name = sh(script: "git show -s --pretty=%ae", returnStdout: true).trim()
                mattermostSend (color: 'danger', 
                message: "빌드 실패: ${env.JOB_NAME} #${env.BUILD_NUMBER} by ${Author_ID}(${Author_Name})\n(<${env.BUILD_URL}|Details>)", 
                endpoint: 'https://meeting.ssafy.com/hooks/97gr1wff138tmqum7exwc75h7c', 
                channel: 'B202'
                )
            }
        }
    }
}
