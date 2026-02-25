---
layout: project
title: "태양광 기반 세종시 모기 퇴치 솔루션"
summary: "YOLOv5 + 태양광 + Raspberry Pi 기반 실시간 모기 탐지·방제 시스템. 현장 엣지 추론, 대시보드, 다학제 협업."
image: assets/images/mobile-landscape.jpg
technologies: [YOLOv5, Python, Raspberry Pi, OpenCV, Dashboard]
github:
categories: ml
---

## 프로젝트 배경

세종시 여름철 말라리아 모기 대량 발생 문제를 해결하기 위해, 태양광+Raspberry Pi+YOLOv5로 현장 실시간 탐지·방제 시스템을 개발했습니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| **실시간 모기 탐지** | YOLOv5 경량화 모델, Raspberry Pi 엣지 추론, 카메라 실시간 캡처 |
| **태양광 전원** | 외부 전원 없이 장기 운영, 배터리 충전 자동화 |
| **발생 알림** | 임계값 초과 시 서버 알림, 방제 담당자 실시간 대응 |
| **대시보드** | 탐지 데이터 시각화, 지점별/시간별 발생량 모니터링 |

## 시스템 구조

```
태양광 패널 → 배터리 → Raspberry Pi(카메라, YOLOv5 추론)
                        ├─ 임계값 초과 시 서버 알림
                        └─ 탐지 데이터 → 대시보드
```

## 담당 업무 (융합팀)

- YOLOv5 학습/경량화/엣지 배포 파이프라인 구축
- 모기 이미지 데이터셋 수집·라벨링, 커스텀 모델 반복 학습
- Raspberry Pi + 태양광 전원 + 카메라 + 서버 연동 및 통신 테스트
- 대시보드(웹) 설계 및 데이터 시각화
- 컴공/전자/경영 다학제 협업 일정 조율 및 우선순위 관리


## 기술 스택

| 기술 | 역할 |
|------|------|
| **YOLOv5** | 모기 탐지 커스텀 모델, 경량화(Pruning, Quantization) |
| **Python + OpenCV** | 카메라 캡처, 추론 파이프라인 |
| **Raspberry Pi** | 엣지 디바이스, 태양광 전원 연동 |
| **Dashboard(웹)** | 탐지 데이터 시각화, 실시간 모니터링 |
