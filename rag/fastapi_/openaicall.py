import os
import json
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class LlmClient:
    def __init__(self):
        # Gemini API 키 설정
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        
        # 백엔드 URL 설정
        self.back_url = os.getenv("BACKEND_URL", "http://localhost:8080")
        
        # 기본 모델 설정
        self.model = "gemini-2.0-flash"  # 기본 모델
    
    def call_llm(self, system_prompt, user_prompt):
        """
        Gemini 모델을 호출하여 응답을 생성합니다.
        
        Args:
            system_prompt (str): 시스템 프롬프트 (Gemini에서는 user_prompt와 합쳐집니다)
            user_prompt (str): 사용자 프롬프트
            
        Returns:
            response: OpenAI 형식과 호환되는 응답 객체
        """
        try:
            # 시스템 프롬프트와 사용자 프롬프트를 합칩니다
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            
            # Gemini API URL 생성
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            
            # 헤더 설정
            headers = {
                "Content-Type": "application/json",
                "Referer": self.back_url
            }
            
            # 요청 본문 구성
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": combined_prompt}
                        ]
                    }
                ]
            }
            
            # API 요청
            response = requests.post(api_url, headers=headers, json=payload)
            response_data = response.json()
            
            # Gemini 응답을 OpenAI 형식에 맞게 변환
            return self._convert_to_openai_format(response_data)
            
        except Exception as e:
            print(f"Gemini API 호출 중 오류 발생: {str(e)}")
            raise
    
    def _convert_to_openai_format(self, gemini_response):
        """
        Gemini API 응답을 OpenAI 형식으로 변환합니다.
        
        Args:
            gemini_response (dict): Gemini API의 원본 응답
            
        Returns:
            dict: OpenAI 형식의 응답 객체
        """
        # 응답이 없는 경우 빈 응답 반환
        if not gemini_response or "candidates" not in gemini_response or not gemini_response["candidates"]:
            return self._create_empty_response()
        
        try:
            # Gemini 응답에서 텍스트 추출
            text = gemini_response["candidates"][0]["content"]["parts"][0]["text"]
            
            # OpenAI와 유사한 응답 구조 생성
            openai_format = {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": text
                        },
                        "finish_reason": "stop",
                        "index": 0
                    }
                ],
                "created": 0,
                "model": self.model,
                "object": "chat.completion"
            }
            
            # 응답 객체를 클래스로 변환
            return OpenAIResponse(openai_format)
        except Exception as e:
            print(f"응답 변환 중 오류 발생: {str(e)}")
            return self._create_empty_response()
    
    def _create_empty_response(self):
        """빈 응답 객체를 생성합니다."""
        empty_response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "응답을 생성할 수 없습니다."
                    },
                    "finish_reason": "stop",
                    "index": 0
                }
            ],
            "created": 0,
            "model": self.model,
            "object": "chat.completion"
        }
        return OpenAIResponse(empty_response)

class OpenAIResponse:
    """OpenAI 응답 형식을 흉내내는 클래스"""
    
    def __init__(self, response_data):
        self.data = response_data
        self.choices = [Choice(choice) for choice in response_data.get("choices", [])]
        self.created = response_data.get("created", 0)
        self.model = response_data.get("model", "")
        self.object = response_data.get("object", "")

class Choice:
    """OpenAI의 Choice 객체를 흉내내는 클래스"""
    
    def __init__(self, choice_data):
        self.message = Message(choice_data.get("message", {}))
        self.finish_reason = choice_data.get("finish_reason", "")
        self.index = choice_data.get("index", 0)

class Message:
    """OpenAI의 Message 객체를 흉내내는 클래스"""
    
    def __init__(self, message_data):
        self.role = message_data.get("role", "")
        self.content = message_data.get("content", "")