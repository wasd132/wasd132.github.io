---
layout: project
title: "Blind Project - 시각장애인 보행 보조장치"
summary: "YOLOv5 커스텀 모델 + Android 앱 기반 실시간 보행 보조장치. 제9회 대한민국 SW 융복합 해커톤 대회 전북도지사상 수상."
image: assets/images/mentors.jpg
technologies: [YOLOv5, CVAT, Python, Android Studio, Raspberry Pi, OpenCV, Socket, PyGame]
github: https://github.com/KunsanDADLab/BlindProject
categories: ml
---

## 프로젝트 배경

기존 보행 보조장치(흰 지팡이, 안내견)의 한계를 보완하기 위해, **제9회 대한민국 SW 융복합 해커톤 대회**에서 YOLOv5 실시간 객체 인식 기반 보행 보조장치를 개발했습니다.

<video width="100%" controls>
  <source src="{{ site.baseurl }}/assets/videos/blind2.mp4" type="video/mp4">
</video>

## 시스템 구조

```
[Android 앱 (카메라)] → TCP 소켓 → [서버: YOLOv5 추론] → 결과 전송 → [앱: 음성 경고]
```

| 구성요소 | 역할 |
|---------|------|
| **Android 앱** | 카메라 촬영 → JPEG 인코딩 → TCP 전송 → TTS 음성 경고 |
| **YOLOv5 서버** | 커스텀 모델 추론, 긴급/경고 등급 분류, 진로 방해 판별 |
| **객체 분류** | 긴급 — 스쿠터, 오토바이, 자전거, 자동차, 버스 / 경고 — 볼라드, 벤치, 사람, 배수구 덮개 등 |

<video width="100%" controls>
  <source src="{{ site.baseurl }}/assets/videos/blind1.mp4" type="video/mp4">
</video>

## 주요 기능

| 기능 | 설명 |
|------|------|
| **실시간 객체 탐지** | YOLOv5 커스텀 모델, 640×640, Conf 0.25, IoU 0.45, CUDA 가속 |
| **진로 방해 판별** | 좌표 기반 삼각형 영역 필터링 — 보행 경로 밖 객체는 경고 제외 |
| **음성 경고** | PyGame 기반 8방위 방향 안내, 긴급/경고 등급별 차등 알림 |
| **Android 앱** | TCP 소켓 통신, TTS 출력, 자동 재연결 (최대 10회) |

<img src="{{ site.baseurl }}/assets/images/blind-path-detection.png" alt="진로 방해 판별 알고리즘" width="100%">

> 노란색 삼각형 영역 안에 들어오는 객체만 경고 대상으로 판별합니다.

## 담당 업무 (5인 팀)

### 1. 학습 환경 구축 — Docker 기반 CVAT 서버 배포
- CVAT를 Docker Compose로 팀 서버에 배포, 12개 탐지 클래스 사전 등록 및 YOLO 포맷 직접 내보내기 설정
- 모델 버전을 `detect_v1` → `detect_v2` → `server_09.17`(해커톤 최종)로 반복 학습하며 성능 개선

### 2. 라벨링 품질 관리
- 클래스별 바운딩 박스 기준 문서화 (볼라드 3종 비교 예시 포함)
- **1차 라벨링 → 교차 검수 → 수정** 3단계 프로세스 도입, 초기 오분류 20건 이상 보정

### 3. 일정 관리
- 500장 단위 Task 분배 및 진행률 추적, D-7 시점 핵심 클래스(스쿠터, 볼라드) 우선 라벨링으로 전환
- 라벨링 마감 → 학습 시작 일정 연동으로 파이프라인 전환 시간 최소화

## 기술 스택

| 기술 | 역할 |
|------|------|
| **YOLOv5 + CVAT** | 커스텀 전이학습, Docker 기반 팀 단위 라벨링 |
| **Android Studio (Java)** | 카메라 API, TCP 소켓, TTS 음성 경고 |
| **Python + OpenCV + Socket** | TCP 서버, 이미지 수신/추론 |
| **Raspberry Pi** | 초기 프로토타입 (GPIO, RGB LED, 카메라 모듈) |

## 성과

- **제9회 대한민국 SW 융복합 해커톤 대회** 전북도지사상 수상 (2022.08)
