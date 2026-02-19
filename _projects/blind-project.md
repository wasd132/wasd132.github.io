---
layout: project
title: "Blind Project - 시각장애인 보행 보조장치"
summary: "시각장애인을 위한 보행 보조장치입니다. Yolov5를 사용하여 장애인의 주변 환경을 인식하고, 사용자에게 경고를 제공합니다."
image: assets/images/mentors.jpg
technologies: [Yolov5, CVAT, Python]
github: https://github.com/KunsanDADLab/BlindProject/tree/main
categories: ml
---

## 프로젝트 배경

시각장애인은 독립적인 보행 시 다양한 위험 요소에 노출됩니다. 기존의 보행 보조장치(흰 지팡이, 안내견 등)는 한계가 있으며, 실시간 객체 인식 기술을 활용한 새로운 보조 시스템의 필요성이 대두되었습니다.

## 주요 기능

- **실시간 객체 탐지**: YOLOv5를 활용하여 보행 경로 상의 장애물, 차량, 신호등 등을 실시간 인식
- **음성 경고 시스템**: 탐지된 위험 요소에 대해 사용자에게 음성으로 경고 제공
- **데이터 라벨링**: CVAT를 활용하여 학습 데이터를 효율적으로 라벨링

## 기술 스택 상세

### YOLOv5
- 경량화된 실시간 객체 탐지 모델 적용
- 커스텀 데이터셋을 활용한 전이학습(Transfer Learning) 수행
- mAP(Mean Average Precision) 기반 모델 성능 최적화

### CVAT (Computer Vision Annotation Tool)
- Docker 기반 CVAT 환경을 구축하여 팀 단위 데이터 라벨링 수행
- 바운딩 박스 어노테이션으로 학습 데이터 제작

## 성과

- **제9회 대한민국 SW 융복합 해커톤 대회** 전북도지사상 수상 (2022.08)
