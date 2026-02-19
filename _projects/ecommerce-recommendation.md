---
layout: project
title: "이커머스 데이터 기반 개인화 추천 시스템"
summary: "Apriori 알고리즘과 LTR(Learning to Rank)을 활용하여 구매자를 위한 상품 추천 시스템을 구축했습니다."
image: assets/images/raspberry-pi-monitor.png
technologies: [Python, APriori, LTR]
github:
categories: ml
---

## 프로젝트 배경

이커머스 플랫폼에서 사용자 경험을 향상시키기 위해 개인화 추천 시스템은 필수적입니다. 구매 이력, 열람 기록, 장바구니 데이터를 복합적으로 분석하여 각 사용자에게 최적의 상품을 추천하는 시스템을 설계 및 구현했습니다.

## 주요 기능

- **연관 규칙 마이닝**: Apriori 알고리즘으로 상품 간 연관 관계 도출
- **개인화 랭킹**: LTR(Learning to Rank) 모델을 활용한 추천 결과 순위 최적화
- **데이터 파이프라인**: 원시 데이터 전처리부터 모델 학습까지의 파이프라인 구축

## 기술 스택 상세

### Apriori Algorithm
- 빈발 항목 집합(Frequent Itemset) 도출
- 지지도(Support), 신뢰도(Confidence), 향상도(Lift) 기반 연관 규칙 생성
- 최소 지지도 임계값 조정을 통한 규칙 품질 관리

### LTR (Learning to Rank)
- 사용자 행동 데이터를 피처로 변환
- 랭킹 모델 학습을 통한 추천 결과 개인화
- NDCG(Normalized Discounted Cumulative Gain) 기반 성능 평가

## 성과

- **T-SUM 데이터 분석/인공지능 경진대회** 최우수상 수상 (2024.12)
- ML모델링 멘토로 활동
