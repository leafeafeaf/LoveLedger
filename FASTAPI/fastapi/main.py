print("🟢 FastAPI main.py 진입")

import requests
import uvicorn
import json, sys, os, datetime, torch
ROOT_DIR = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
ROOT_DIR_MODEL = os.path.join(ROOT_DIR, 'model')
sys.path.append(ROOT_DIR)
sys.path.append(ROOT_DIR_MODEL)
import pandas as pd
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from pydantic import BaseModel
from openaicall import LlmClient
from embeddingcall import EmbeddingClient
from langchain.embeddings import HuggingFaceEmbeddings




from model.inference_streamlit import load_model, inference, calc
from model.modules.preprocess import preprocess_infer

ES_URL = os.getenv("ES_URL", "http://localhost:9200")
ES_INDEX_NAME = os.getenv("ES_INDEX_NAME", "loveledger_dense")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "jhgan/ko-sroberta-multitask")
DEVICE = os.getenv("DEVICE", "cpu")
PORT = int(os.getenv("UVICORN_PORT", 8001))


device = torch.device(DEVICE if torch.cuda.is_available() else 'cpu')

app = FastAPI(
    title='LoveLedger FastAPI',
    description='This is a demo of LoveLedger FastAPI',
)
llmClient = LlmClient()
embeddingClient = EmbeddingClient()

MODEL, TOKENIZER = load_model('KoBERT', 26, 'Cross Entropy', 'cpu')
try:
    print("🚀 모델 로딩 시도 중...")
    MODEL1, TOKENIZER1 = load_model('KoBERT', 26, 'Cross Entropy', 'cpu')
    print("✅ 모델 로딩 성공")
except Exception as e:
    print(f"❌ 모델 로딩 실패: {e}")
    import traceback
    traceback.print_exc()
    MODEL1, TOKENIZER1 = None, None  # 또는 그냥 raise 해서 명확히 터뜨려도 됨


MODEL2, TOKENIZER2 = load_model('KoELECTRA', 26, 'Cross Entropy', 'cpu')
MODEL3, TOKENIZER3 = load_model('RoBERTa', 32, 'Cross Entropy', 'cpu')

class QueryRequest(BaseModel):
    query: str
    transactions: list
    date_range: dict
    gender: str
    marital_status: bool
    previous_story: str = ""
    theme: str

MODEL_DICT = {'KoBERT_26_CrossEntropy' : MODEL1}
              # 'KoELECTRA_26_CrossEntropy' : MODEL2,
              # 'RoBERTa_32_CrossEntropy' : MODEL3}
TOKEN_DICT = {'KoBERT_26_CrossEntropy' : TOKENIZER1}
              # 'KoELECTRA_26_CrossEntropy' : TOKENIZER2,
              # 'RoBERTa_32_CrossEntropy' : TOKENIZER3}


class InferenceData(BaseModel):
    model: str
    name: str

class InferenceData_(BaseModel):
    model_name: str
    file: str

def convert_to_dataframe(data):
    return pd.read_csv(data)

@app.get("/test")
def test():
    return "zz"

@app.post("/inference_single")
def inference_single(inp: InferenceData):
    model_name = inp.model
    merch_name = inp.name
    MODEL = MODEL_DICT[model_name]
    TOKENIZER = TOKEN_DICT[model_name]
    # if model_name == 'KoBERT_26_CrossEntropy':
    MODEL.model.to(device)
    cate, prob = inference(preprocess_infer(merch_name), 26, MODEL, TOKENIZER, device, topk = True)
    MODEL.model.cpu()
    result = pd.DataFrame({'업종' : cate.flatten(), '예측확률' : prob.flatten()})
    result_json = result.to_json(orient = 'records')
    result_response = JSONResponse(json.loads(result_json))
    return result_response

class HistoryList(BaseModel):
    names: list[str]

@app.post("/history/code")
def inference_codes(inp: HistoryList):
    model_name = "KoBERT_26_CrossEntropy"
    names = inp.names

    MODEL = MODEL_DICT[model_name]
    TOKENIZER = TOKEN_DICT[model_name]
    MODEL.model.to(device)

    codes = calc(names, 26, MODEL, TOKENIZER, device)

    MODEL.model.cpu()
    return {"results": [{"name": n, "code": c} for n, c in zip(names, codes)]}

@app.post("/inference_csv")
def inference_csv(inp: InferenceData_):
    model_name = inp.model_name
    df_json = inp.file
    df = pd.read_json(df_json)

    df.reset_index(drop = True, inplace = True)

    # inference, 요일 붙이기
    MODEL = MODEL_DICT[model_name]
    TOKENIZER = TOKEN_DICT[model_name]
    # if model_name == 'KoBERT_26_CrossEntropy':
    MODEL.model.to(device)
    inferdf, _ = inference(preprocess_infer(df), 26, MODEL, TOKENIZER, device)
    MODEL.model.cpu()
    weekday_list = ['월','화','수','목','금','토','일']
    day = []
    for i in range(len(inferdf)):
        day.append(weekday_list[datetime.datetime.strptime(inferdf['거래일자'][i], '%Y-%m-%d').weekday()])
    inferdf['요일'] = day

    inferdf_json = inferdf.to_json(orient = 'records')
    inferdf_response = JSONResponse(json.loads(inferdf_json))

    return inferdf_response


@app.post("/query_rag")
async def handle_query_rag(request: QueryRequest):
    hf = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    embedding_vector = hf.embed_query(request.query)
    relevant_documents = []

    search_term = request.query
    print(f"검색 키워드: '{search_term}'")

    try:
        # 더 구체적인 쿼리 생성 - 단일 키워드가 아닌 문맥 추가
        query_text = f"한국 인터넷 밈: {request.query}"
        print(f"임베딩 요청 텍스트: {query_text}")
        # embedding_vector = embeddingClient.call_llm(query_text).data[0].embedding

        if not embedding_vector or len(embedding_vector) == 0:
            print("경고: 임베딩 벡터가 비어 있습니다. 검색 생략.")
            return {"error": "임베딩 생성 실패로 검색 생략"}
        else:
            print(f"임베딩 벡터 생성 완료. 차원: {len(embedding_vector)}")
    except Exception as e:
        print(f"임베딩 생성 중 오류: {str(e)}")
        return {"error": f"임베딩 생성 오류: {str(e)}"}

    try:
        # 최소 유사도 점수 임계값 추가
        MIN_SCORE_THRESHOLD = 1.01  # 코사인 유사도는 -1~1이지만 +1.0이 추가되어 0~2 범위

        body_data = {
            "query": {
                "script_score": {
                    "query": {
                        "bool": {
                            "filter": {
                                "exists": {"field": "script_Vector"}
                            }
                        }
                    },
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, doc['script_Vector']) + 1.0",
                        "params": {"query_vector": embedding_vector}
                    }
                }
            },
            "size": 20,  # 더 많은 결과 검색 후 필터링
            "_source": ["script", "href"]
        }

        print(f"Elasticsearch 검색 쿼리: {json.dumps(body_data, indent=2, ensure_ascii=False)}")
        elastic_response = requests.get(
            f"{ES_URL}/{ES_INDEX_NAME}/_search",
            headers={"Content-Type": "application/json"},
            json=body_data
        )

        print(f"Elasticsearch 검색 응답 코드: {elastic_response.status_code}")
        if elastic_response.status_code == 200:
            elastic_data = elastic_response.json()

            # 결과 및 점수 확인을 위한 상세 로깅 추가
            hits = elastic_data.get("hits", {}).get("hits", [])
            print(f"\n=== 검색 결과 총 {len(hits)}개 ===")
            print("상위 5개 결과의 점수:")
            for i, hit in enumerate(hits[:5]):
                score = hit.get("_score", 0)
                source = hit.get("_source", {})
                script_preview = source.get("script", "")
                if isinstance(script_preview, list) and script_preview:
                    script_preview = script_preview[0]
                if isinstance(script_preview, str):
                    script_preview = script_preview[:50]
                print(f"[{i + 1}] 점수: {score:.3f} - {script_preview}...")

            # 최소 유사도 점수로 필터링
            filtered_hits = [hit for hit in hits if hit.get("_score", 0) >= MIN_SCORE_THRESHOLD]
            print(f"\n=== 임계값({MIN_SCORE_THRESHOLD}) 이상 결과 {len(filtered_hits)}개 ===")

            for i, hit in enumerate(filtered_hits):
                score = hit.get("_score", 0)
                source = hit.get("_source", {})
                script = source.get("script", "")
                href = source.get("href", "")

                if isinstance(script, list):
                    for item in script:
                        if item and len(item.strip()) > 0:
                            relevant_documents.append(item)
                    if href:
                        relevant_documents.append(f"출처: {href}")
                elif isinstance(script, str):
                    relevant_documents.append(script)
                    if href:
                        relevant_documents.append(f"출처: {href}")
                else:
                    print(f"경고: 예상치 못한 script 타입: {type(script)}")

            print(f"관련 문서 수: {len(relevant_documents)}개")
        else:
            print(f"Elasticsearch 검색 실패: {elastic_response.text}")
    except Exception as e:
        print(f"Elasticsearch 요청 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

    transactions_text = "\n".join([f"- {t['date']}: {t['description']} - {t['amount']}원" for t in request.transactions])
    start_date = request.date_range["start_date"]
    end_date = request.date_range["end_date"]

    if relevant_documents:
        meme_information = "\n\n".join(relevant_documents)[:3000]  # LLM 입력 길이 제한
        print("\n--- RAG로 가져온 밈 정보 (상위 3개 미리보기) ---")
        for i, doc in enumerate(relevant_documents[:3]):
            print(f" [{i + 1}] {doc[:100]}")
        print("--- 전체 밈 항목 수:", len(relevant_documents), "---")

        system_prompt = f"""
        당신은 사용자의 금융 거래 내역을 바탕으로 밈을 활용한 창의적인 소설을 작성하는 AI입니다.
        특히 '{request.query}'와(과) 관련된 밈을 활용하여 소비내역을 재미있게 해석하고 이야기로 변환합니다.
        아래 제공된 밈 정보를 최우선으로 활용하여 소설을 구성하세요:
        --- 밈 정보 ---
        {meme_information}
        이 정보를 바탕으로 소비내역과 연결시켜 창의적이고 재미있는 이야기를 만들어주세요.
        """
    else:
        # 백업 방법: 일반적인 인터넷 밈 지식 활용
        system_prompt = f"""
        당신은 사용자의 금융 거래 내역을 바탕으로 밈을 활용한 창의적인 소설을 작성하는 AI입니다.
        특히 '{request.query}'와(과) 관련된 한국 인터넷 밈을 활용하여 소비내역을 재미있게 해석하고 이야기로 변환합니다.

        요청한 키워드에 대한 RAG 검색 결과가 관련성이 낮아 당신의 일반 지식을 활용해 소설을 작성해주세요.
        한국에서 잘 알려진 인터넷 밈 중에서 '{request.query}'와(과) 관련된 것을 선택하여 활용하세요.
        """

    question_prompt = f"""
    [입력값]
    - 키워드: {request.query}
    - 테마: {request.theme}
    - 거래 기간: {start_date} ~ {end_date}
    - 거래 내역:
    {transactions_text}
    - 이전 소설 내용:
    {request.previous_story}
    - 성별:
    {request.gender}
    - 사용자 결혼 여부:
    {'기혼' if request.marital_status else '미혼'}

    ---

    [출력 포맷]
    {{"title": "소설 제목", "content": "소설 본문 내용"}}

    ---

    [스토리 생성 규칙]
    1. '{request.query}'와(과) 관련된 밈을 활용하여 이야기를 구성하세요.
    2. 결혼 여부와 성별에 따라 등장인물 설정을 적절히 조정하세요.
    3. 소비 내역은 이야기의 핵심 힌트로 활용하되 진부하게 표현하지 마세요.
    4. 줄바꿈은 '\\n'으로 표현하고, JSON은 반드시 markdown code block으로 감싸세요 (```json ... ```)
    """

    try:
        print("LLM 호출 시작")
        response = llmClient.call_llm(system_prompt, question_prompt)
        print("LLM 응답 생성 완료")
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        print(f"LLM 호출 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"소설 생성 중 오류가 발생했습니다: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT)
