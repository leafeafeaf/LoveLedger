# pip install --upgrade --quiet langchain faiss-cpu tiktoken langchain-google-genai
# pip install langchain_community
# pip install sentence-transformers
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import json

hf = HuggingFaceEmbeddings(model_name='jhgan/ko-sroberta-multitask')

def main() -> None:
    # 인터넷 밈_json 파일
    file_path = "rag/mimmim_korea.json"

    # 저장할 파일
    result_path = "mimmim_embeding.json"
    result = []

    with open(file_path,"r",encoding="utf-8") as file:
        data = json.load(file)

        for i,datas in enumerate(data):
            content_data = datas['script']
            links_data = datas['links']

            content_response = FAISS.from_texts(content_data,embedding=hf)
    
            # 제목+내용 데이터 벡터화
            content_vectors_data = []
            for k in range(content_response.index.ntotal):
                vec = content_response.index.reconstruct(k)
                content_vectors_data.append(vec.tolist())
            print(i,content_vectors_data)

            result.append({
                "script" : content_data,
                "script_Vector" : content_vectors_data,
                "links" : links_data
            })
    
    with open(result_path,'w',encoding="utf-8") as json_file:
        json.dump(result, json_file,ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
