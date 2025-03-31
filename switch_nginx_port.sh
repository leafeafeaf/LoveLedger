#!/bin/bash
set -e

NGINX_TEMPLATE="/etc/nginx/sites-available/default.template"
NGINX_CONFIG="/etc/nginx/sites-available/default"
PORT_FILE="/tmp/current_port"

# 현재 사용 중인 포트 확인
if [ -f "$PORT_FILE" ]; then
    CURRENT_PORT=$(cat "$PORT_FILE")
else
    CURRENT_PORT=8002  # 첫 실행 시 기본 포트
fi

# 다음 포트 결정
if [ "$CURRENT_PORT" -eq 8001 ]; then
    NEW_PORT=8002
else
    NEW_PORT=8001
fi

# 환경 변수 설정 (envsubst 용도)
export APP_PORT=$NEW_PORT

echo "Switching NGINX to port: $NEW_PORT"

# 템플릿을 실제 NGINX 설정으로 변환
sudo -E envsubst '$APP_PORT' < "$NGINX_TEMPLATE" > "$NGINX_CONFIG"

# 새로운 포트 저장
echo "$NEW_PORT" > "$PORT_FILE"

# NGINX Reload
sudo nginx -s reload

echo "NGINX successfully switched to port $NEW_PORT"
