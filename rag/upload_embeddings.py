import json
import requests
import time
from typing import List, Dict, Any

def upload_embeddings_to_elasticsearch(
    file_path: str, 
    index_name: str,
    elasticsearch_url: str = "http://localhost:9200",
    batch_size: int = 20,
    sleep_time: float = 0.5
) -> None:
    """임베딩 데이터를 Elasticsearch에 업로드합니다."""
    
    print(f"{file_path} 파일에서 데이터를 읽어오는 중...")
    
    try:
        # 기존 인덱스 삭제
        try:
            delete_response = requests.delete(f"{elasticsearch_url}/{index_name}")
            print(f"기존 인덱스 삭제 응답: {delete_response.status_code}")
            time.sleep(1)  # 삭제 후 잠시 대기
        except Exception as e:
            print(f"인덱스 삭제 중 오류 (무시 가능): {str(e)}")
        
        # 인덱스 매핑 생성
        mapping = {
            "mappings": {
                "properties": {
                    "script": {"type": "text", "analyzer": "standard"},
                    "script_Vector": {
                        "type": "dense_vector",
                        "dims": 768,  # jhgan/ko-sroberta-multitask 모델은 768차원 벡터 사용
                        "index": True,
                        "similarity": "cosine"
                    },
                    "href": {"type": "keyword"}
                }
            }
        }
        
        create_response = requests.put(
            f"{elasticsearch_url}/{index_name}",
            headers={"Content-Type": "application/json"},
            json=mapping
        )
        print(f"인덱스 생성 응답: {create_response.status_code} - {create_response.text}")
        time.sleep(1)  # 생성 후 잠시 대기
        
        # 임베딩 파일 로드
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        print(f"로드된 문서 수: {len(data)}")
        
        # 데이터 형식 확인 및 변환
        documents = []
        for doc in data:
            scripts = doc.get("script", [])
            vectors = doc.get("script_Vector", [])
            href = doc.get("links", "")
            
            # 각 스크립트 항목별로 문서 생성
            if len(scripts) != len(vectors):
                print(f"경고: script({len(scripts)})와 script_Vector({len(vectors)})의 길이가 다릅니다.")
                continue
                
            # 모든 스크립트를 하나의 문서로 통합
            documents.append({
                "script": scripts,
                "script_Vector": vectors[0] if vectors else [],  # 첫 번째 벡터를 대표 벡터로 사용
                "href": href
            })
            
        print(f"처리된 문서 수: {len(documents)}")
        
        # 첫 번째 문서 구조 확인
        if documents:
            print("\n첫 번째 문서 구조:")
            for key, value in documents[0].items():
                if key == "script_Vector":
                    print(f"script_Vector: 벡터 (길이: {len(value)})")
                elif key == "script":
                    print(f"script: 리스트 (항목 수: {len(value)})")
                    if value:
                        print(f"  첫 번째 항목: {value[0][:100]}")
                else:
                    print(f"{key}: {value}")
                    
        # 배치 단위로 처리
        batches = [documents[i:i + batch_size] for i in range(0, len(documents), batch_size)]
        success_count = 0
        error_count = 0
        
        for batch_idx, batch in enumerate(batches):
            print(f"\n배치 {batch_idx+1}/{len(batches)} 처리 중... ({len(batch)}개 문서)")
            
            # 벌크 요청 데이터 준비
            bulk_data = []
            for doc in batch:
                # script_Vector 필드 유효성 검사
                vector = doc.get("script_Vector", [])
                if not vector or not isinstance(vector, list) or len(vector) != 768:
                    print(f"  경고: 유효하지 않은 벡터 (길이: {len(vector) if isinstance(vector, list) else 'N/A'})")
                    continue
                
                # 인덱스 요청 추가
                bulk_data.append({"index": {"_index": index_name}})
                bulk_data.append(doc)
            
            if not bulk_data:
                print("  처리할 문서가 없습니다.")
                continue
                
            # 벌크 업로드 요청
            try:
                bulk_response = requests.post(
                    f"{elasticsearch_url}/_bulk",
                    headers={"Content-Type": "application/x-ndjson"},
                    data="\n".join(json.dumps(item) for item in bulk_data) + "\n"
                )
                
                if bulk_response.status_code in (200, 201):
                    response_data = bulk_response.json()
                    has_errors = response_data.get("errors", False)
                    
                    if has_errors:
                        errors = [item for item in response_data["items"] if "error" in item.get("index", {})]
                        error_count += len(errors)
                        success_count += len(bulk_data) // 2 - len(errors)
                        
                        if errors:
                            first_error = errors[0]["index"]["error"]
                            print(f"  오류 발생: {len(errors)}개 문서")
                            print(f"  첫 번째 오류: {first_error.get('type')}: {first_error.get('reason')}")
                    else:
                        success_count += len(bulk_data) // 2
                        print(f"  성공: {len(bulk_data) // 2}개 문서")
                else:
                    error_count += len(bulk_data) // 2
                    print(f"  요청 실패: {bulk_response.status_code} - {bulk_response.text[:200]}")
            
            except Exception as e:
                error_count += len(bulk_data) // 2
                print(f"  요청 오류: {str(e)}")
            
            # 서버 부하 방지 대기
            time.sleep(sleep_time)
        
        print(f"\n업로드 완료: 성공 {success_count}개, 실패 {error_count}개")
        
        # 인덱스 상태 확인
        try:
            stats_response = requests.get(f"{elasticsearch_url}/{index_name}/_stats")
            if stats_response.status_code == 200:
                stats_data = stats_response.json()
                doc_count = stats_data["indices"][index_name]["total"]["docs"]["count"]
                print(f"인덱스 문서 수: {doc_count}")
            else:
                print(f"인덱스 상태 확인 실패: {stats_response.status_code}")
        except Exception as e:
            print(f"인덱스 상태 확인 오류: {str(e)}")
        
    except FileNotFoundError:
        print(f"오류: {file_path} 파일을 찾을 수 없습니다.")
    except json.JSONDecodeError:
        print(f"오류: {file_path} 파일의 JSON 형식이 올바르지 않습니다.")
    except Exception as e:
        print(f"오류 발생: {str(e)}")

if __name__ == "__main__":
    # 설정
    file_path = "rag/mimmim_embeding.json"  # 임베딩 데이터 파일
    index_name = "loveledger_dense"     # Elasticsearch 인덱스 이름
    elasticsearch_url = "http://localhost:9200"  # Elasticsearch URL
    
    # 업로드 실행
    upload_embeddings_to_elasticsearch(
        file_path=file_path,
        index_name=index_name,
        elasticsearch_url=elasticsearch_url,
        batch_size=10,  # 한 번에 처리할 문서 수 (작게 설정)
        sleep_time=1.0  # 배치 간 대기 시간 (충분히 길게)
    )