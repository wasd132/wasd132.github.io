---
layout: project
title: "BLP 기반 리눅스 커널 접근통제 모듈"
summary: "Bell-LaPadula 모델의 'No Read Up, No Write Down' 정책을 Kprobe 후킹으로 커널 레벨에서 강제하는 MAC 모듈. 방산기업 내부자 위협 시나리오를 통해 4단계 보안 등급 체계를 검증했습니다."
image: assets/images/s3scan.png
technologies: [C, Linux Kernel, Kprobe, Hashtable, BLP Model]
github:
categories: security
---

## 프로젝트 배경

DAC만으로는 내부자 위협을 막을 수 없는 환경(방산기업 등)에서, BLP 모델의 **"No Read Up, No Write Down"** 원칙을 리눅스 커널의 Kprobe 함수 후킹으로 구현하여 파일 접근 시 보안 등급을 강제 검증하는 MAC 커널 모듈을 개발했습니다.

## BLP 모델 동작 원리

### No Read Up — `vfs_read` 후킹

<img src="{{ site.baseurl }}/assets/images/read module.png" alt="Read Module 동작 원리" width="100%">

- `vfs_read` 후킹 → `dentry_path_raw()`로 경로 획득 → 해시테이블에서 등급 조회
- `cur_user_level < cur_doc_level` 위반 시: `copy_to_user(buf, "\x00", count)` + `regs->ax = count`로 빈 데이터 반환 (시스템 안정성 유지)

### No Write Down — `do_filp_open` 후킹

<img src="{{ site.baseurl }}/assets/images/open module.png" alt="Open Module 동작 원리" width="100%">

- `do_filp_open` 후킹 → `open_flag & (O_WRONLY | O_RDWR)` 검사
- `cur_user_level > cur_doc_level` 위반 시: `-EACCES` 반환, fd 생성 자체 차단

### 차단 결과
<img src="{{ site.baseurl }}/assets/images/call fail.jpg" alt="로그에서 차단된 것을 확인" width="100%">

## 보안 위협 시나리오

보안을 요구하는 기업에 근무하는 내부자가 적대 기업에게 기밀 문서(Level 2: Secret)를 이동식 저장소(Level 0~1)로 복사하려는 시나리오로 구성

- A씨(Level 2)가 Level 0 저장소에 쓰기 시도 → **No Write Down** 위반 → `do_filp_open`에서 차단
- 차단 즉시 `/var/log/kern.log`에 기록 → 보안 관리자에게 보고

## 담당 업무 (6인 팀, R&D팀 팀장)

### 1. 접근통제 정책 연구
- MAC/DAC/RBAC 비교 분석, BLP 모델 선정 근거 제시
- 4단계 보안 등급 체계(Unclassified → Top Secret) 정의, 등급별 접근 규칙 명세화
- SELinux·AppArmor 등 기존 LSM과의 차별점 정리
- 관련 논문 2편 분석·요약하여 팀 내 발표

### 2. 보안 위협 시나리오 설계
- 방산기업 내부자 위협 시나리오 초안 작성 및 보완
- 등급별 보호 대상 파일(장비 설계도, 사내 기밀)과 구체적 접근 규칙 명세화
- 완성된 시나리오가 개발팀의 BLP 검증 로직 구현의 직접적 기반이 됨

### 3. 개발팀 기술 지원
- 커널 패닉 이슈 발생 시 SELinux MAC 메커니즘 조사·브리핑
- 시나리오 기반 테스트 케이스(No Read Up/No Write Down 위반, root 예외) 제시하여 정책 검증

### 4. 프로젝트 관리
- 매주 정기 회의 주도, 팀별 업무 할당 및 진행 상황 점검
- PM팀 보고서 구조·LaTeX 작성·발표 흐름 구성 지원
- 최종 보고서 초안 첨삭 및 정확성·일관성 검수

### 5. AI(LLM) 접근 통제 연구

<img src="{{ site.baseurl }}/assets/images/AI control.jpg" alt="AI 접근 통제 모델" width="100%">

- 멘토님 제안으로 약 6주간 연구, 적대적 프롬프팅 관련 논문 5건+ 분석
- AI 접근 통제 모델·정책·워크플로우 3종 결과물 완성, 최종 발표 '향후 연구' 섹션에 포함

## 문제 해결

| 문제 | 해결 |
|------|------|
| `do_filp_open`에서 `filename` 접근 시 OS 종료 | 해시테이블에 경로를 미리 저장하고 후킹 시 조회하는 방식으로 변경 |
| `vfs_read` 직접 차단 시 시스템 불안정 | `copy_to_user()`로 빈 데이터 반환 + `regs->ax` 설정으로 우회 |
| `write` 직접 후킹 시 원본 파일 삭제 | `do_filp_open` 단계에서 fd 생성 자체를 차단하여 선제 방어 |
| `printk` 과다 호출로 커널 로그 폭주 | 정책 위반 시에만 로깅, 정상 접근은 로깅 생략 |

## 기술 스택

| 기술 | 역할 |
|------|------|
| **C + Linux Kernel API** | 커널 모듈, pt_regs 레지스터 조작, pre_handler |
| **Kprobe** | `do_filp_open`, `vfs_read` 동적 후킹 |
| **Hashtable** | `DEFINE_HASHTABLE` 매크로, O(1) 등급 조회 |
| **VFS** | `dentry_path_raw()` 경로 추출, `open_flags` 분석 |
| **Python** | 보안 등급 규칙 관리 CLI (add.py) |
