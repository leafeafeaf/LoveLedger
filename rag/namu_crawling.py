import warnings
import shutil
import subprocess
import time
import json
import html
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
import requests
import chromedriver_autoinstaller
import re

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
divs = soup.find_all('div', class_='fYTOcmXG')


# div마다 처리
for i, div in enumerate(divs):
    
    # a 태그가 있을 경우 링크 추출
    a_tags = div.find_all('a')
    # print(a_tags)
    if(len(a_tags)>0):
        a = a_tags[0]
        href = a.get('href')
        if href.startswith("/w/"):
            base = "https://namu.wiki"
            full_url = base + href 
            text = a.get_text(strip=True)
            print(f"--- div[{i}] ---")
            print("내용:", div.get_text(strip=True))
            print(f"🔗 링크 텍스트: {text} / 링크 URL: {full_url}")
            print()

            soup = request_page(full_url)

            blockquotes = soup.find_all('blockquote', class_='_47dRqTXz')
            # 한글만 추출하는 정규표현식
            pattern  = re.compile(r"[가-힣0-9\.\']+")

            # 출력
            for i, blockquote in enumerate(blockquotes):
                all_text = blockquote.get_text(separator=' ', strip=True)  # 모든 텍스트
                korean = pattern .findall(all_text)              # 한글만 추출
                if korean:
                    # print(f"--- div[{i}] ---")
                    print(' '.join(korean))
                    print()
    