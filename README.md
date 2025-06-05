# 🧸 LoveLedger

<p align="center">
    <img src="./img/logo.png">
</p>
**"금융 내역 기반 그림 일기 가계부 모바일 서비스"**

[📘 API 명세서](https://fanatical-fisher-639.notion.site/API-1ac855ca54ea81ddae09d562ed06097a?source=copy_link) · [🎨 발표 자료](https://www.canva.com/design/DAGkGKLY1Lc/nmwvDEQ9ydIVKm0wXxBByA/view?utm_content=DAGkGKLY1Lc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h24903cf5b5#7) · [🧸 콘텐츠 기획서](https://www.canva.com/design/DAGguU9ryks/zIQbMzNfOiDiXiDAf9D88g/edit)

---

## 🧸 프로젝트 개요

#### 프로젝트 이름: LoveLedger

#### 진행 기간: 2025.02.24 ~ 2025.04.13

#### 서비스 소개:

LoveLedger는 사용자의 귀찮은 금융 관리와 가계부 작성을 자동화하고 금융 내역을 기반으로 한 그림 소설을 제공해 금융 관리에 재미를 더해줍니다.

---

## ✨ 주요 기능 및 서비스 화면

#### 1. 사용자 계정 관리

- Google 소셜 로그인
- 사용자 계좌 등록
- 부부 계좌 연동

<p align="center">
    <img src="./img/login.jpg" alt="로그인 화면" style= "width : 150px">
    <img src="./img/couple2.jpg" alt="로그인 화면" style= "width : 150px">
    <img src="./img/couple.jpg" alt="로그인 화면" style= "width : 150px">
</p>

#### 2. 가계부 기능

- **금융 내역 불러오기**: SSAFY 금융 API 연동하여 실시간 금융 내역 조회
- **금융 내역 카테고리화**: KoBert 기반 카테고리 분류 모델로 소비 유형 분류
- **통계 및 시각화**: 주간, 월간에 따른 소비 패턴 및 지출 내역 요약

<p align="center">
    <img src="./img/calander.jpg" alt="동화 서비스 화면" style="width : 150px">
    <img src="./img/detail.jpg" alt="동화 서비스 화면" style= "width : 150px">
    <img src="./img/ledger.jpg" alt="동화 서비스 화면" style= "width : 150px">
</p>

#### 3. 금융 내역 기반 그림 소설

- 스토리 생성 설정(뉴스, 파파라치, 판타지, 러브코미디, 유행어 5가지 스타일 선택)
- 금융 내역 기반 스토리 생성 (프롬프트 엔지니어링 적용)
- 스토리 기반 그림 생성 및 저장 (6가지 스타일에 따른 표지 생성)
- 소설 라이브러리

<p align="center">
    <img src="./img/story.jpg" alt="동화 서비스 화면" style= "width : 150px">
    <img src="./img/story2.jpg" alt="동화 서비스 화면" style= "width : 150px">
    <img src="./img/library.jpg" alt="동화 서비스 화면" style= "width : 150px">

</p>

## 🧪 카테고리 분류 모델 학습 결과 (KoBERT)

<p align="center">
    <img src="./img/model.png" alt="설정 화면">
</p>

## 🔍 기술 스택 및 구조

| 구성      | 기술                                         |
| --------- | -------------------------------------------- |
| Frontend  | React Native, TypeScript, expo , React-Query |
| Backend   | Spring Boot, JPA, Redis, MySQL               |
| AI Server | FastAPI, PyTorch, KoBERT                     |
| Infra     | Docker, GitLab CI/CD, AWS S3                 |
| 기타      | Jenkins                                      |

<p align="center">
    <img src="./img/architecture.png" alt="설정 화면">
</p>

## 📄 문서 및 참고 링크

- [API 명세서](https://fanatical-fisher-639.notion.site/API-1ac855ca54ea81ddae09d562ed06097a?source=copy_link)

- [ERD](https://fanatical-fisher-639.notion.site/ERD-1ac855ca54ea8177b413fd46fb8f968a?source=copy_link)

- [요구사항 정의서 & 기능 명세서](https://docs.google.com/spreadsheets/d/1mhXzsyjTDqlWeEmA6ppZ3pnGrrh1Iglm8hz90-1pSfc/edit?usp=sharing)

- [개발 환경 가이드](https://fanatical-fisher-639.notion.site/1ac855ca54ea819c83ddcd1ca0e251bf?source=copy_link)

- [플로우 차트](https://fanatical-fisher-639.notion.site/1ac855ca54ea8096a515c6c593e6b4c8?source=copy_link)

## 🧑‍💻 팀원 소개

|     역할     | 이름                              |
| :----------: | :-------------------------------- |
| **Frontend** | 강성운 · 신경원                   |
| **Backend**  | 김성민 · 백승민 · 상승규 · 편민준 |
|  **Infra**   | 김성민 · 상승규                   |
