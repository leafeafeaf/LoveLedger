# pip install --upgrade --quiet langchain faiss-cpu tiktoken langchain-google-genai
# pip install langchain_community
# pip install sentence-transformers
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import json

hf = HuggingFaceEmbeddings(model_name='jhgan/ko-sroberta-multitask')

def main() -> None:
    # 인터넷 밈_json 파일
    file_path = "밈(인터넷_용어)대한민국.json"

    # 저장할 파일
    result_path = "embeded.json"
    result = []

    with open(file_path,"r",encoding="utf-8") as file:
        data = json.load(file)
        links_data = data['links']

        for i,link in enumerate(links_data):

            text_data = link["text"]
            href_data = link["href"]

            # print(text_data)
            # print(href_data)

            response = FAISS.from_texts(text_data,embedding=hf)
            
            vectors_data = []
            for k in range(response.index.ntotal):
                vec = response.index.reconstruct(k)
                vectors_data.append(vec.tolist())
            print(i,vectors_data)

            result.append({
                "Vector" : vectors_data,
                "text" : text_data,
                "href" : href_data,
            })
    
    with open(result_path,'w',encoding="utf-8") as json_file:
        json.dump(result, json_file,ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()