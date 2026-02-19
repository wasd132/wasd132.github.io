---
layout: project
title: "MITRE ATT&CK 기반 지능형 침해사고 분석 및 자동 대응 시스템 구축"
summary: "시스템 콜 기반 행위 탐지와 MITRE TTP 매핑을 통해 위협을 정량화하고, SOAR를 활용한 자동 대응까지 구현한 통합 보안 아키텍처를 구현했습니다."
image: assets/images/google-cloud-backup.png
technologies: [Wazuh, Falco, Shuffle, Python, Docker]
github:
categories: security
---

## 프로젝트 배경

현대 사이버 공격은 점점 정교해지고 있으며, 단일 보안 솔루션만으로는 효과적인 탐지와 대응이 어렵습니다. MITRE ATT&CK 프레임워크를 기반으로 공격 기법(TTP)을 체계적으로 분류하고, 다계층 탐지와 자동 대응을 통합한 보안 오케스트레이션 시스템을 구축했습니다.

## 주요 기능

- **행위 기반 탐지**: Falco를 활용한 시스템 콜 레벨 실시간 위협 탐지
- **로그 상관 분석**: Wazuh SIEM을 통한 분산 로그 수집 및 상관 분석
- **TTP 매핑**: 탐지된 이벤트를 MITRE ATT&CK 기법에 자동 매핑
- **위험도 정량화**: 탐지 이벤트의 위험도를 스코어링하여 정규화
- **자동 대응(SOAR)**: Shuffle을 활용한 자동 대응 워크플로우 실행

## 시스템 아키텍처

### 탐지 레이어
1. **Falco**: 커널의 시스템 콜을 모니터링하여 비정상 행위 탐지
   - 컨테이너 escape 시도 탐지
   - 권한 상승(Privilege Escalation) 행위 감지
   - 의심스러운 프로세스 실행 탐지

2. **Wazuh Agent**: 호스트 기반 이벤트 수집
   - 파일 무결성 모니터링(FIM)
   - 취약점 탐지
   - 로그 분석 및 룰 기반 알림

### 분석 레이어
- **Wazuh Manager**: 수집된 이벤트의 상관 분석 수행
- **MITRE ATT&CK 매핑**: 탐지 룰에 ATT&CK Technique ID 태깅
- **Risk Scoring**: 이벤트의 심각도, 빈도, 자산 가치를 고려한 위험도 계산

### 대응 레이어
- **Shuffle (SOAR)**: 자동 대응 플레이북 실행
  - IP 차단 (방화벽 룰 자동 추가)
  - 악성 프로세스 종료
  - 알림 전송 (이메일, Slack 등)

## 기술 스택 상세

### Docker Compose 기반 환경
- 전체 시스템을 Docker Compose로 컨테이너화하여 배포
- 구성 요소 간 네트워크 분리 및 보안 설정

### Python 자동화 스크립트
- Wazuh API 연동을 통한 커스텀 알림 처리
- Shuffle 워크플로우 트리거를 위한 웹훅 연동
- 위험도 스코어링 엔진 구현
