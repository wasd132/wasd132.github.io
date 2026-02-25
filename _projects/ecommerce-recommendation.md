---
layout: project
title: "이커머스 데이터 기반 개인화 추천 시스템"
summary: "Apriori 연관 규칙 마이닝과 LGBMRanker를 결합한 하이브리드 상품 추천 시스템. 멘토로서 3명의 멘티를 지도하며 NDCG 0.867을 달성, T-SUM 경진대회 최우수상 수상."
image: assets/images/raspberry-pi-monitor.png
technologies: [Python, Apriori, LightGBM, LGBMRanker, Pandas, Kaggle]
github:
categories: ml
---

## 프로젝트 배경

DACON 이커머스 고객 거래 데이터셋(Customer, Online Sales, Discount, Marketing, Tax)을 활용하여, 연관 규칙 마이닝 + Learning to Rank를 결합한 **하이브리드 개인화 추천 시스템**을 구축했습니다. T-SUM 데이터 분석/인공지능 경진대회 출전 프로젝트입니다.

## 추천 알고리즘 파이프라인

```
[1] Apriori 연관 규칙 마이닝
    거래 데이터 → 지지도 0.004 / 신뢰도 0.4 → 약 45만 개 규칙
    → Lift 기준 상품당 상위 5개 유사 아이템 추출

[2] LTR 학습 데이터 구성
    구매 상품(6점) + 유사 상품 5개(5~1점) + 비관련 상품 3개(0점)
    + 고객·상품 피처(성별, 지역, 카테고리, 금액)

[3] LGBMRanker 학습
    lambdarank 손실 함수, GroupShuffleSplit → 평균 NDCG 0.867

[4] 추천 생성
    랭킹 예측 → 기구매 상품 제외 → 상위 N개 노출
```

## EDA 주요 발견

<img src="{{ site.baseurl }}/assets/images/vis.jpg" alt="데이터 시각화" width="100%">

- 고객당 연간 평균 **30개** 상품 구매 — 지속적 플랫폼 사용 패턴
- **8월** 거래량 최고, 상위 3개 상품(Apparel, Nest-USA, Office)이 전체 변동 주도
- 마케팅 비용과 거래액 간 뚜렷한 상관관계 없음
- 할인율은 3개월 주기 고정(10%/20%/30%), 성별 간 선호 카테고리 차이 미미

## 담당 업무 (멘토, 멘티 3명 지도)

<img src="{{ site.baseurl }}/assets/images/edu.jpg" alt="멘토링 사진" width="100%">

### 1. 멘토링 및 프로젝트 관리
- 10주간 주 1회 멘토링: Python 기초 → Pandas → 시각화 → ML 기초(Decision Tree) 단계적 교육
- 멘티 의견 수렴 후 데이터 확보 가능성·경진대회 적합성을 고려하여 최종 주제 선정
- 서울시 공공데이터 vs DACON 데이터셋 비교 후, 칼럼 수와 표본 품질 기준으로 DACON 선택

### 2. EDA 설계 및 지도
- 멘티별 데이터셋 1개씩 분배, 분석 프레임워크(고객 분포·카테고리·할인 효과) 제시
- 분석 결과 피드백 → 유의미한 인사이트(월별 추이, 쿠폰 패턴 등) 도출
- 협업 환경: VSCode Live Share 시도 후 Kaggle 노트북으로 전환

### 3. 추천 알고리즘 설계 및 구현
- Apriori + LGBMRanker 하이브리드 아키텍처 설계
- LTR 점수 체계(구매 6점 / 유사 5~1점 / 비관련 0점) 정의 및 학습 데이터셋 구성
- 트렌드 기반 Rule-based 보조 추천 시스템 추가 설계

### 4. 모델 평가 및 발표
- NDCG@k 기반 성능 평가, 피처 중요도 시각화
- 경진대회 발표자료(12p) 제작 및 발표

## 기술 스택

| 기술 | 역할 |
|------|------|
| **Apriori (mlxtend)** | 연관 규칙 마이닝, Lift 기반 유사 아이템 추출 |
| **LGBMRanker** | Learning to Rank, lambdarank 손실 함수 |
| **Pandas + pandasql** | 데이터 전처리, SQL 기반 조인 |
| **Matplotlib / Seaborn / Plotly** | EDA 시각화 |
| **scikit-learn** | NDCG 평가, StandardScaler, GroupShuffleSplit |

## 성과

- **T-SUM 데이터 분석/인공지능 경진대회 최우수상** (2024.12)
- 평균 NDCG **0.867** 달성
- 멘토로서 3명의 멘티를 10주간 지도 (Python 기초 → ML 모델링)
