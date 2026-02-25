---
layout: project
title: "MITRE ATT&CK 기반 침해사고 자동 탐지·대응 시스템"
summary: "Falco + Wazuh + Shuffle SOAR를 결합하여, 제로데이 역직렬화 공격을 커널 시스템 콜 레벨에서 탐지하고 10초 이내 자동 격리까지 수행하는 보안 운영 시스템을 구축했습니다."
image: assets/images/google-cloud-backup.png
technologies: [Wazuh, Falco, Shuffle, OPNsense, MISP, AbuseIPDB, Docker, Python]
github:
categories: security
---

## 프로젝트 배경

경계 보안 솔루션(FW, IPS, WAF)은 시그니처 기반으로 동작하여 제로데이 역직렬화 페이로드를 정상 트래픽으로 오인합니다. **"Assume Breach"** 전제 하에, 내부 프로세스 레벨에서 이상 징후를 식별하고 자동 대응하는 시스템을 구축했습니다.

**핵심 발견**: Java/PHP/Node.js의 역직렬화 진입점은 다르지만, 공격 성공 후 시스템 콜 행위(비정상 쉘 생성)는 수렴합니다. 이를 기반으로 언어에 종속되지 않는 커널 레벨 탐지 정책을 수립했습니다.

## 시스템 아키텍처

![시스템 아키텍처](/assets/images/Network%20Architecture.jpg)

| 계층 | 솔루션 | 역할 |
|------|--------|------|
| **탐지** | Falco | 커널 시스템 콜 감시, Kill Chain 6단계 커스텀 YAML 룰 |
| **수집·분석** | Wazuh | 로그 정규화, FIM, SCA, MITRE ATT&CK 자동 태깅 |
| **오케스트레이션** | Shuffle | 7단계 스코어링 엔진, 자동 대응 파이프라인 |
| **TI** | MISP, AbuseIPDB | 해시/IP IoC 대조, 교차 검증 |
| **방화벽** | OPNsense | API 기반 IP 자동 차단 |

### 스코어링 & 자동 대응

Shuffle 워크플로우에서 Wazuh Level 12+ 이벤트를 수신하면, IP 평판(AbuseIPDB) + IoC 매칭(MISP) + SCA 취약도 + 행위별 가중치를 합산하여 위험도를 정량화합니다.

| 등급 | 임계치 | 자동 대응 |
|------|--------|----------|
| **Critical** | ≥100점 | 포렌식 스냅샷 → 네트워크 격리 → 프로세스 Kill |
| **High** | ≥70점 | OPNsense API로 공격자 IP 차단 |
| **Warning** | ≥40점 | Slack 알림 (IP, FIM 이력, 평판 점수) |

## 공격 시나리오 (React2Shell 7단계)

| 단계 | 공격 행위 | MITRE ATT&CK | 등급 |
|------|----------|-------------|------|
| 1 | 역직렬화 → 리버스 쉘 | T1190 + T1573.002 | **CRITICAL** |
| 2 | env, whoami 정찰 | T1082, T1016 | WARNING |
| 3 | HISTFILE=/dev/null | T1070.003 | **CRITICAL** |
| 4 | SUID 바이너리 탐색 | T1548.001 | **CRITICAL** |
| 5 | 메모리 내 실행 + 파일 암호화 | T1059.006 + T1486 | **CRITICAL** |
| 6 | eval() 백도어 삽입 | T1505.003 | DETECT |
| 7 | docker.sock → 컨테이너 탈출 | T1611 + T1070 | **CRITICAL** |

<video width="100%" height="auto" controls>
  <source src="/assets/videos/Interrupt_attack.mp4" type="video/mp4">
</video>

## 담당 업무 (4인 팀, 팀장)

### 1. Java 역직렬화 공격 연구
- CVE-2021-44228(Log4Shell) 기반 JNDI Lookup → LDAP 콜백 → RCE 공격 체인을 Docker 환경에서 재현
- RCE 후 PID 1의 자식으로 `/bin/sh`가 Fork되는 **비정상 프로세스 계보**를 포착 → Falco 탐지 룰의 핵심 조건으로 활용
- Java `readObject()`, PHP `__wakeup`/`__destruct`, Node.js Prototype Pollution 비교 분석 → 3개 언어 공통 메커니즘("객체 복원 시 임의 코드 실행") 확인

### 2. Wazuh SIEM 구축

<img src="{{ site.baseurl }}/assets/images/rules.png" alt="falco 이벤트 파싱 룰" width="100%">
- Falco에서 전달되는 로그를 Wazuh Agent를 통해 수신하고, 커스텀 디코더/룰을 작성하여 Falco 이벤트를 Wazuh 대시보드에서 상세하게 파싱·출력하도록 구성
- CDB 리스트에 악성 IP/해시 등록, Falco 이벤트의 IoC 실시간 대조
- FIM으로 웹 디렉토리 파일 변경 감시, 10분 윈도우 내 대량 변경 시 랜섬웨어 분류
- MITRE ATT&CK 매핑 뷰 구성으로 Tactic/Technique 시각화

### 3. MISP 위협 인텔리전스 연동
- Shuffle에서 Wazuh FIM 해시값을 MISP API로 자동 조회하는 파이프라인 구축
- AbuseIPDB + MISP 교차 검증, 외부 지표를 ×0.1 보조 가중치로 제한하여 내부 행위 기반 탐지에 우선순위 부여

### 4. Active Response 포렌식 스크립트
- Critical 판정 시, 격리직전 netstat·프로세스 목록·환경변수·열린 파일 등 휘발성 데이터를 자동 수집하는 스크립트 개발
- 격리 후 소멸되는 리버스 쉘 원격 IP, 세션 정보를 선제 보존하여 포렌식 완전성 확보
- 코드: [shellscript-for-Volatile-Data-Collection](https://github.com/wasd132/shellscript-for-Volatile-Data-Collection)

### 5. 네트워크 페일오버 구현
- WAF에 구성된 Nginx를 활용하여 Active–Standby Failover를 구현, Primary 장애 시 Standby로 자동 전환되도록 구성

<details>
<summary>nginx.conf 설정 보기</summary>

```nginx
# /usr/local/nginx/conf/nginx.conf

load_module modules/ngx_http_modsecurity_module.so;

user  www-data;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # ===============================
    # [Active-Standby Upstream]
    # - ACTIVE: 192.168.10.62:3000
    # - STANDBY: 192.168.10.64:3000 (backup)
    # ===============================
    upstream backend_servers {
        # Active
        server 192.168.10.62:3000 max_fails=1 fail_timeout=3s;

        # Standby
        server 192.168.10.64:3000 backup;

        keepalive 32;
    }

    # ==========================================
    # [WAF Server] : vm0 (Nginx + ModSecurity)
    # Client -> WAF(80) -> Backend(Active/Standby)
    # ==========================================
    server {
        listen       80;
        server_name  localhost;

        # WAF(ModSecurity) 활성화
        modsecurity on;
        modsecurity_rules_file /usr/local/nginx/conf/modsec/main.conf;

        location / {
            proxy_pass http://backend_servers;

            # Failover 속도/조건 튜닝
            proxy_connect_timeout 1s;
            proxy_read_timeout 10s;
            proxy_next_upstream error timeout http_502 http_503 http_504;
            proxy_next_upstream_timeout 10s;
            proxy_next_upstream_tries 2;

            # 헤더 전달
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_redirect off;
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }
    }

    # ==========================================
    # 다른 포트 프록시
    # ==========================================
    server {
        listen       8080;
        server_name  localhost;

        location / {
            proxy_pass http://10.0.0.80:8000;
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root html;
        }
    }
}
```

</details>

### 6. 프로젝트 총괄
- 주간보고서·보고서 초안(3차)·발표 대본·최종 보고서 작성 총괄
- 4주차 3개 언어 시나리오 파편화 문제 → React2Shell 단일 시나리오 통합 방향 전환 주도

## 문제 해결

| 문제 | 해결 |
|------|------|
| Sysmon이 Ubuntu에서 미지원 | 커널 모듈 기반 **Falco**로 전환 |
| Falco 기본 룰 노이즈 과다 | 커스텀 룰 튜닝 + `proc.pcmdline` `-i` 옵션으로 관리자/공격자 구분 |
| TheHive+Cortex 워크플로우 한계 | **Shuffle**로 전환, No-Code 파이프라인 구축 |
| 언어별 시나리오 파편화 | 시스템 콜 수렴 발견 → React2Shell 단일 시나리오로 통합 |
| Shuffle Cache 스코어 합산 오류 | Agent ID 기반 세션 관리 로직 고도화 |

## 성과

| 지표 | 수동 대응 | 자동 대응 | 개선율 |
|------|----------|----------|--------|
| **MTTR** | 15~30분 | **10초 이내** | **98%+ 단축** |

| 시나리오 | 탐지율 | 대응 성공률 |
|----------|--------|-----------|
| 역직렬화 Remote Shell | **100%** | **100%** |
| Ransomware (FIM) | **85%** | **100%** |
| 권한 상승·내부망 이동 | **90%** | **80%** |

