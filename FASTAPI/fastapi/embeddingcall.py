import os
import requests
from dataclasses import dataclass
from typing import List, Optional
from dotenv import load_dotenv
from langchain.embeddings import HuggingFaceEmbeddings

# 환경 변수 로드
load_dotenv()

@dataclass
class EmbeddingData:
    embedding: List[float]
    
@dataclass
class EmbeddingResponse:
    data: List[EmbeddingData]

class EmbeddingClient:
    def __init__(self):
        # 백엔드 URL 설정
        self.back_url = os.getenv("BACKEND_URL", "http://localhost:8080")
        
        # HuggingFace 모델 초기화 (문서와 동일한 모델 사용)
        self.model = HuggingFaceEmbeddings(model_name='jhgan/ko-sroberta-multitask')
        
        # 백업으로 Gemini API 키 설정
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.use_huggingface = True  # 기본적으로 HuggingFace 모델 사용
    
    def call_llm(self, text):
        """
        텍스트를 임베딩 벡터로 변환합니다.
        
        Args:
            text (str): 임베딩할 텍스트
            
        Returns:
            EmbeddingResponse: 임베딩 벡터를 포함한 응답 객체
        """
        try:
            if self.use_huggingface:
                # HuggingFace 모델을 사용하여 임베딩 생성 (문서와 동일한 모델)
                try:
                    embedding_vector = self.model.embed_query(text)
                    print(f"HuggingFace 모델을 사용하여 임베딩 생성 (차원: {len(embedding_vector)})")
                    embedding_data = EmbeddingData(embedding=embedding_vector)
                    return EmbeddingResponse(data=[embedding_data])
                except Exception as hf_error:
                    print(f"HuggingFace 임베딩 생성 중 오류: {str(hf_error)}")
                    print("Gemini API로 폴백...")
                    self.use_huggingface = False
            
            # HuggingFace가 실패하면 Gemini API 사용 (폴백)
            if self.api_key:
                # Google AI API URL 생성 (Vertex AI의 임베딩 API)
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={self.api_key}"
                
                # 헤더 설정
                headers = {
                    "Content-Type": "application/json",
                    "Referer": self.back_url
                }
                
                # 요청 본문 구성
                payload = {
                    "content": {
                        "parts": [
                            {"text": text}
                        ]
                    }
                }
                
                # API 요청
                response = requests.post(api_url, headers=headers, json=payload)
                response_data = response.json()
                
                # 임베딩 벡터 추출
                embedding_vector = response_data.get("embedding", {}).get("values", [])
                print(f"Gemini API를 사용하여 임베딩 생성 (차원: {len(embedding_vector)})")
                
                # 우리 데이터 클래스 형식으로 변환
                embedding_data = EmbeddingData(embedding=embedding_vector)
                return EmbeddingResponse(data=[embedding_data])
            else:
                raise ValueError("임베딩 모델을 사용할 수 없으며 GEMINI_API_KEY도 설정되지 않았습니다.")
                
        except Exception as e:
            print(f"임베딩 생성 중 오류 발생: {str(e)}")
            # 오류 발생 시 빈 임베딩 반환
            return EmbeddingResponse(data=[EmbeddingData(embedding=[])])