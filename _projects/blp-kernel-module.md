---
layout: project
title: "접근통제 정책 집행을 위한 리눅스 커널 모듈 개발"
summary: "Bell-LaPadula(BLP) 모델을 Kprobe 기반으로 구현한 강제 접근통제(MAC) 커널 모듈입니다. 'No Read Up, No Write Down' 정책을 커널 레벨에서 강제하여 방산기업 등 민감한 정보를 다루는 환경에서 내부자 위협을 차단합니다. 가상의 시나리오를 통해 4단계 보안 등급을 검증합니다."
image: assets/images/s3scan.png
technologies: [C, Linux Kernel, Kprobe, Hashtable, BLP Model]
github:
categories: security
---

## 개요
국가 중요시설 및 방산 기업 환경에서는 DAC(임의적 접근통제)만으로 내부자 위협과 기밀 유출을 방어하기 어렵습니다. 이를 해결하기 위해 리눅스 커널 영역에서 동작하는 BLP(Bell-LaPadula) 기밀성 모델 기반의 강제적 접근통제(MAC) 모듈을 설계 및 구현했습니다. Kprobe를 활용해 VFS(가상 파일 시스템) 레벨의 시스템 콜을 동적으로 후킹하여, 파일 접근 시 사용자 및 파일의 보안 등급을 실시간으로 검증하고 위반 시도를 원천 차단하는 시스템을 구축했습니다.

## 핵심 기능 및 보안 정책 (BLP 모델)
4단계 다중등급보안(MLS) 체계(Unclassified ~ Top Secret)를 커널 해시테이블에 적재하고, Kprobe 후킹을 통해 BLP 모델의 2대 핵심 원칙을 리눅스 커널 레벨에서 강제했습니다.

1. No Read Up (상위 등급 읽기 금지)
정책: 낮은 보안 등급의 사용자가 높은 등급의 기밀 파일을 읽는 것을 차단합니다.

동작 원리: vfs_read 함수를 후킹하여 파일 읽기 시도를 감지합니다. 해시테이블에서 등급을 조회하여 정책 위반(User Level < Doc Level) 감지 시, 실제 파일 내용 대신 사용자 공간 버퍼를 빈 데이터(NULL)로 채워 기밀 유출을 방지합니다.

2. No Write Down (하위 등급 쓰기 금지)
정책: 높은 보안 등급의 사용자가 하위 등급 파일에 기밀 정보를 기록(유출)하는 것을 차단합니다.

동작 원리: 시스템 콜 단계에서 write를 직접 막지 않고, 파일이 열리는 do_filp_open 함수를 후킹합니다. O_WRONLY 또는 O_RDWR 플래그가 포함된 접근 중 정책 위반(User Level > Doc Level)이 발견되면 파일 디스크립터(fd) 생성 자체를 차단하여 접근을 원천 봉쇄합니다.


## BLP 모델 동작 원리

BLP 모델의 2대 핵심 속성을 Kprobe 후킹으로 구현합니다:

### 1. No Read Up (Simple Security Property)
**낮은 보안 등급의 사용자가 높은 보안 등급의 데이터를 읽을 수 없도록 합니다.**

<img src="{{ site.baseurl }}/assets/images/read module.png" alt="Read Module 동작 원리" width="100%">

- **정책**: 사용자는 자신의 보안 등급보다 높은 등급의 파일을 읽을 수 없음
- **예시**: Level 1(Confidential) 엔지니어가 Level 2(Secret) 장비 설계도 파일을 `cat` 시도 → 차단
- **구현 방식 (read_hook.c)**: 
  1. `vfs_read` 후킹으로 파일 읽기 시도 감지
  2. `dentry_path_raw()`로 절대 경로 획득
  3. 해시테이블에서 사용자 UID와 파일 경로의 보안 등급 조회
  4. `cur_user_level < cur_doc_level` 조건 위반 시:
     - `copy_to_user(buf, "\x00", count)`로 버퍼를 0으로 채움
     - `regs->ax = count`로 읽은 바이트 수 설정
     - 실제 `vfs_read()`는 호출되지 않음 (시스템 안정성 유지)

### 2. No Write Down (Star Property)
**높은 보안 등급의 사용자가 낮은 보안 등급의 데이터에 쓸 수 없도록 합니다.**

<img src="{{ site.baseurl }}/assets/images/open module.png" alt="Open Module 동작 원리" width="100%">

- **정책**: 사용자는 자신의 보안 등급보다 낮은 등급의 파일에 쓸 수 없음
- **예시**: Level 2(Secret) 사용자가 Level 1(Confidential) 파일에 기밀 정보를 복사 → 차단
- **목적**: 고위험 정보가 낮은 보안 등급 파일로 유출되어 권한 없는 사용자에게 노출되는 것 방지
- **구현 방식 (open_hook.c)**:
  1. `do_filp_open` 후킹으로 파일 열기 시도 감지
  2. `open_flags` 구조체에서 `open_flag` 확인
  3. `op->open_flag & (O_WRONLY | O_RDWR)` 로 write 권한 검사
  4. `cur_user_level > cur_doc_level` 조건 위반 시 `-EACCES` 반환
  5. fd 생성 자체가 차단되어 이후 `write()` 시스템 콜이 호출되지 않음


## 보안 위협 시나리오

### 배경
주식회사 "파란 독수리"는 민간 방산기업으로, 최근 국가 중요시설로 지정되면서 보안 시스템을 개편했습니다. 보안 담당자는 강제적 접근통제(MAC) 정책을 기반으로 서버 접근 권한을 할당하기로 결정했습니다.

### 공격 시나리오
한편, 적대 국가의 경쟁 기업 "빨간 호랑이"는 "파란 독수리"의 중요 정보를 탈취하려는 음모를 꾸밉니다. "파란 독수리"의 경력직 엔지니어 A씨는 "빨간 호랑이"로부터 특채 입사 제안을 받으며, 회사의 중요 정보를 유출하면 고액의 금액과 더 높은 직급을 제공한다는 현혹에 넘어갑니다.

A씨는 회사의 중요 정보들이 '공용 파일 저장소'에 저장되어 관리된다는 것을 알고 있었기에, 사내 정보망에 접속하여 중요한 회사 비밀인 '장비 설계도(Level 2: Secret)'를 유출하고자 합니다.

### BLP 모듈에 의한 차단
A씨는 디렉토리에 접근하는 데 성공하지만, 파일을 자신의 이동식 저장소(Level 0 또는 Level 1로 분류)에 복사-붙여넣기 하려는 순간, **"No Write Down" 정책**에 위배되어 저장소 접근에 실패합니다.

<img src="{{ site.baseurl }}/assets/images/call fail.jpg" alt="로그에서 차단된 것을 확인" width="100%">

- A씨의 보안 등급: Level 2 (Secret)
- 대상 파일 (이동식 저장소): Level 0 또는 Level 1
- 위반 정책: `cur_user_level (2) > cur_doc_level (0 or 1)` → Write 차단
- 실제 동작: `do_filp_open` 후킹에서 `-EACCES` 반환, fd 생성 실패

### 결과
실패와 동시에 이 사실은 시스템 로그(`/var/log/kern.log`)에 기록되고 보안 담당 관리자에게 보고되었으며, 결국 A씨는 산업 스파이라는 것이 밝혀집니다.

## 기술 스택

- **C + Linux Kernel API** — 커널 모듈 개발, pt_regs 레지스터 조작, pre_handler 구현
- **Kprobe Framework** — `do_filp_open`, `vfs_read` 함수 동적 후킹, 런타임 접근 제어
- **Hashtable** — `DEFINE_HASHTABLE` 매크로로 보안 등급 관리, O(1) UID/파일경로 조회
- **VFS Internals** — `dentry_path_raw()` 절대 경로 추출, `open_flags` 구조체 분석
- **User-Kernel Communication** — `copy_to_user()`로 버퍼 조작, `regs->ax` 레지스터 값 설정
- **Kernel Debugging** — printk 로그 최적화, 커널 디버깅 환경 구축으로 안정성 확보
- **Python File I/O** — add.py로 /home/lee/rule 파일 기반 규칙 관리

## R&D 팀장으로서의 주요 기여
단순한 모듈 개발을 넘어, '왜 이 기능이 필요한가'를 정의하는 정책 수립부터 커널 패닉을 해결하는 기술 지원까지 R&D와 개발의 가교 역할을 수행했습니다.

### 1. 내부자 위협 시나리오 및 보안 정책 설계
극비 기술을 가진 기업의 고위급 내부자가 극비 파일을(Level 2: Secret)를 개인 저장소(Level 0: Unclassified)로 유출하려는 구체적인 내부자 위협(Insider Threat) 시나리오를 설계했습니다.

이 시나리오를 바탕으로 개발팀이 구현해야 할 접근통제 규칙과 보호 대상(파일 경로), 그리고 감사 로깅의 요건을 명세화하여 프로젝트의 기술적 방향성을 확립했습니다.

### 2. 커널 개발팀 기술 지원 및 테스트 케이스 검증
개발팀이 시스템 콜 후킹 중 커널 패닉 문제를 겪었을 때, 기존 LSM(Linux Security Modules)과 SELinux의 강제적 통제 메커니즘을 리서치하여 안전한 후킹 포인트와 메모리 접근 방식을 제안했습니다.

구현된 커널 모듈의 무결성을 검증하기 위해 'No Read Up 위반', 'No Write Down 위반', 'Root 계정 예외 처리' 등 시나리오 기반의 엣지 케이스(Edge Case) 테스트 시나리오를 작성하고 검증을 주도했습니다.

<img src="{{ site.baseurl }}/assets/images/AI control.jpg" alt="AI 접근 통제 모델" width="100%">

### 3. 향후 연구: AI(LLM) 환경의 접근통제 모델링
기존 시스템 보안을 넘어, 멘토의 피드백을 수용하여 약 6주간 '생성형 AI(LLM) 모델에 대한 접근통제' 심화 연구를 진행했습니다.

적대적 프롬프팅(Adversarial Prompting) 등 최신 보안 논문을 분석하고, 프롬프트 입력 및 응답 단계에서 인가된 정보만 제공되도록 하는 AI 접근통제 아키텍처 및 워크플로우를 도식화하여 최종 보고서에 반영했습니다.



## 기술 의사결정 및 트러블슈팅
커널 레벨의 개발은 작은 실수 하나가 전체 시스템(OS)의 붕괴(Kernel Panic)로 이어집니다. 시스템의 안정성(Stability)과 보안성(Security)을 동시에 확보하기 위해 다음과 같은 아키텍처 및 로직 결정을 내렸습니다.

### 1. 커널 크래시 방지를 위한 O(1) 해시테이블 도입
Situation: 파일 접근 제어를 위해 do_filp_open 후킹 단계에서 filename 인자에 접근하여 권한을 판별하려 했으나, Kprobe 컨텍스트 구조상 불안정한 메모리 참조로 인해 OS가 비정상 종료되는 현상이 반복되었습니다.

Action: 매번 파일명을 추출하는 위험한 방식을 버리고, 커널 모듈 적재 시 정책 파일에 정의된 파일 절대 경로와 보안 등급을 **커널 내부 해시테이블(DEFINE_HASHTABLE)에 미리 캐싱(Pre-load)**하는 구조로 아키텍처를 변경했습니다.

Result: 위험한 포인터 참조를 제거하여 커널 크래시를 완벽히 해결했으며, 파일 접근 시 O(1) 시간 복잡도로 등급을 조회하여 시스템 콜 오버헤드를 최소화했습니다.

### 2. 데이터 무결성과 시스템 안정성을 챙긴 차단(Drop) 로직 설계
Situation: 접근을 차단하기 위해 vfs_read 반환값을 강제로 에러 처리하면 연관된 시스템 프로세스가 멈추는 불안정이 발생했습니다. 또한 write 시스템 콜을 직접 후킹해 중간에 차단하면, 파일 시스템의 일관성이 깨져 원본 파일의 내용이 날아가는(Truncated) 심각한 무결성 훼손이 발생했습니다.

Action: [Read 차단] 시스템 콜을 실패시키는 대신, copy_to_user()를 이용해 사용자 버퍼를 \x00(NULL)으로 채우고 regs->ax = count 레지스터를 조작해 '정상적으로 빈 데이터를 읽은 것처럼' OS를 속이는 우회 기법을 적용했습니다. [Write 차단] write 단계가 아닌, 선행 단계인 do_filp_open에서 쓰기 권한(O_WRONLY) 요청을 검사하고 여기서 디스크립터(fd) 생성을 원천 차단(-EACCES)했습니다.

Result: 기밀 정보 유출을 완벽히 차단하면서도, OS의 정상적인 흐름을 방해하지 않고 기존 파일의 데이터 손상(Corruption)을 방지하는 매우 안정적인 보안 모듈을 완성했습니다.

### 3. 커널 로그 버퍼 오버플로우 방지 (로깅 최적화)
Situation: vfs_read는 OS 내부에서 1초에도 수백 번 호출되는 시스템 콜입니다. 모든 파일 접근을 printk로 로깅하자 커널 로그 버퍼가 초과되어 시스템 성능이 극도로 저하되었습니다.

Action: 감사(Audit)의 목적이 '위협 추적'에 있음을 상기하여, 보안 정책을 위반한 경우(접근 차단 시)에만 커널 로그(/var/log/kern.log)를 기록하도록 로깅 분기문을 최적화했습니다. 로그에는 위반자 UID, 대상 경로, 등급 정보만 남기도록 정규화했습니다.

Result: 모듈 활성화 상태에서도 OS 성능 저하(Overhead)를 없앴으며, 보안 관리자가 유의미한 위협 이벤트(산업 스파이의 유출 시도 등)만 즉시 식별할 수 있는 효율적인 감사 체계를 구축했습니다.