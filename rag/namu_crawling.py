import json
from bs4 import BeautifulSoup, NavigableString
import requests

def request_page(url):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    # 페이지 요청
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    
    # class가 fYTOcmXG인 div 태그 찾기
    return soup

# 나무위키 문서 URL
url = "https://namu.wiki/w/밈(인터넷%20용어)/대한민국"

soup = request_page(url)
divs = soup.find_all('div', class_='M8xPxt04')

json_path= 'C:\\Users\\SSAFY\Desktop\\loveledgerllm\\mimmim_korea.json'

# # 1. 기존 데이터 불러오기 (없으면 빈 리스트)
# if os.path.exists(json_path):
#     with open(json_path, "r", encoding="utf-8") as f:
#         all_results = json.load(f)
# else:
#     all_results = []

all_results = []

# div마다 처리
for j, div in enumerate(divs):
    
    # a 태그가 있을 경우 링크 추출
    a_tags = div.find_all('a')
    if(len(a_tags)>0):
        a = a_tags[0]
        href = a.get('href')
        if href.startswith("/w/"):
            base = "https://namu.wiki"
            full_url = base + href 
            text = a.get_text(strip=True)
            print()

            soup = request_page(full_url)

            contents = []
            contents.append(text)
            blockquotes = soup.find_all('blockquote', class_='xVa8AJLF')
            print(f"--- div[{j}] ---")
            print(f"🔗 링크 텍스트: {text} / 링크 URL: {full_url}")

            # 출력
            for i, blockquote in enumerate(blockquotes):
                # block = blockquote.get_text(separator='\n', strip=True)  # 모든 텍스트

                texts = []
                for child in blockquote.descendants:
                    if isinstance(child, NavigableString):
                        clean_text = child.strip()
                        if clean_text:
                            texts.append(clean_text)

                block = '\n'.join(texts)
                if block:
                    contents.append(block)

            print(contents)
            print()

            # print(f"contents : {contents[0]}")
            # print(f"contents len : {len(contents[0])}")
            # print(f"text : {text}")
            # print(f"len(text) : {len(text)}")
            if len(contents)>=2:
                result = {
                    'script' : contents,
                    'links' : full_url
                }
                print(result)
                all_results.append(result)

with open(json_path,"w",encoding='utf-8') as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)
                
print(f"데이터 저장 완료: {json_path}")

