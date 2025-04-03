# pip install --upgrade --quiet langchain faiss-cpu tiktoken langchain-google-genai
# pip install langchain_community
# pip install sentence-transformers
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import json

hf = HuggingFaceEmbeddings(model_name='jhgan/ko-sroberta-multitask')

def main() -> None:
    # 인터넷 밈_json 파일
    file_path = "mim_korea.json"

    # 저장할 파일
    result_path = "embeding.json"
    result = []

    with open(file_path,"r",encoding="utf-8") as file:
        data = json.load(file)

        for i,datas in enumerate(data):
            title_data = datas['title']
            content_data = datas['content']
            links_data = datas['links']

            title_response = FAISS.from_texts([title_data], embedding=hf)
            content_response = FAISS.from_texts(content_data,embedding=hf)
    
            # 제목 데이터 벡터화
            print("title_response.index.ntotal : ",title_response.index.ntotal)
            title_vectors_data = []
            for k in range(title_response.index.ntotal):
                vec = title_response.index.reconstruct(k)
                title_vectors_data.append(vec.tolist())
            print(i,title_vectors_data)

            # 내용용 데이터 벡터화
            content_vectors_data = []
            for k in range(content_response.index.ntotal):
                vec = content_response.index.reconstruct(k)
                content_vectors_data.append(vec.tolist())
            print(i,content_vectors_data)

            result.append({
                "title" : title_data,
                "title_Vector" : title_vectors_data,
                "content" : content_data,
                "content_Vector" : content_vectors_data,
                "links" : links_data
            })
    
    with open(result_path,'w',encoding="utf-8") as json_file:
        json.dump(result, json_file,ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()