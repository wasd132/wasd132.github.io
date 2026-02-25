---
layout: project
title: "PE-A (Analyzer) - PE 파일 분석 도구"
summary: "PEview, HxD, Detect It Easy 등 파편화된 PE 분석 도구들을 하나의 GUI로 통합한 올인원 분석 도구. 헤더 파싱, 패킹 검사, 헥스 편집, PDF 보고서 생성을 지원합니다."
image: assets/images/mpw.jpg
technologies: [Python, PyQt5, Qt Designer, pefile, ReportLab]
github: https://github.com/ultisy/PE-A
categories: security
---

## 프로젝트 배경

PE 분석 시 PEview(헤더), HxD(헥스), Detect It Easy(패킹) 등 여러 도구를 오가야 하는 문제를 해결하기 위해, 시스템 보안 수업 프로젝트로 올인원 PE 분석 도구를 개발했습니다.

<video width="100%" controls>
  <source src="{{ site.baseurl }}/assets/videos/PE-A.mp4" type="video/mp4">
</video>

## 주요 기능

| 기능 | 설명 |
|------|------|
| **PE 헤더 파싱** | DOS/NT/Section Header를 테이블로 시각화 |
| **패킹 검사** | UPX, ASPack 등 주요 패커 시그니처 자동 탐지 |
| **상세 정보** | Entry Point, EP Section, Compiler Info 분석 |
| **헥스 뷰어 & 에디터** | 오프셋\|헥스\|ASCII 표시, 검색·편집 지원 |
| **PDF 보고서** | 분석 결과 PDF 자동 생성 (한글 지원) |

```
main.py              — 진입점 (의존성 자동 설치)
├── pe_viewer_2_4.py — 메인 UI (헤더 파싱, 패킹 검사)
├── detail.py        — Entry Point 상세 분석
├── hex_viewer.py    — 헥스 뷰어/에디터
└── pdf_sample.py    — PDF 보고서 생성
```

## 담당 업무 (팀장)

### 1. UI/UX 설계

<img src="{{ site.baseurl }}/assets/images/UI.png" alt="UI/UX 디자인 설계" width="100%">

- Qt Designer로 전체 앱 UI 설계 — **파일 선택 → 헤더 분석 → 상세 정보 → 헥스 뷰어 → PDF** 원클릭 워크플로우
- 헤더는 테이블, 상세 정보·헥스 뷰어는 다중 창으로 분리하여 화면 복잡도 관리
- `.ui` 프로토타이핑 → 팀원 피드백 반영 → 레이아웃 확정

### 2. 헥스 뷰어 & 에디터 개발
- 16바이트 단위 **오프셋 | 헥스 | ASCII** 3단 출력, 비출력 문자 `.` 치환
- 바이트 패턴 검색(`4D 5A`, `50 45` 등) → 오프셋 위치 표시
- `file.seek()` → `file.write()`로 오프셋 지정 편집 기능 구현
- 비PE 파일도 헥스 뷰어는 정상 동작하도록 예외 분기 처리

### 3. QA 및 통합 디버깅
- 섹션 이름 NULL 바이트 → `decode('utf-8', errors='replace')` 적용
- ReportLab 한글 깨짐 → 폰트 파일을 프로젝트에 내장하여 경로 의존성 제거
- `PEFormatError` → try-except로 감싸 경고 표시 + 헥스 뷰어 접근 유지
- 정상 PE, UPX 패킹, 비PE 파일 등 다양한 샘플 기반 검증 시나리오 운영

### 4. 일정·리스크 관리
- 기능 간 의존 관계 분석 → 헥스 뷰어·PDF 보고서 병렬 개발 구간 식별
- `PEFormatError` 리스크를 최우선 과제로 격상, 앱 비정상 종료 방지

## 문제 해결

| 문제 | 해결 |
|------|------|
| 비PE 파일 로드 시 `PEFormatError`로 앱 종료 | 예외 처리 + 헥스 뷰어 접근은 유지 |
| 분석 도구 파편화 (PEview, HxD, DIE) | 하나의 GUI에 전 기능 통합, 원클릭 워크플로우 |
| 헥스 뷰어 읽기 전용 한계 | 오프셋 지정 편집 기능 추가 |
| 외부 라이브러리 미설치 시 실행 불가 | `__import__()` 체크 → pip 자동 설치 |

## 기술 스택

| 기술 | 역할 |
|------|------|
| **Python + pefile** | PE 구조 파싱, struct 바이너리 언패킹 |
| **PyQt5 + Qt Designer** | GUI 앱, QTableWidget, QDialog 다중 창 |
| **ReportLab** | PDF 보고서 생성, 한글 폰트 지원 |
