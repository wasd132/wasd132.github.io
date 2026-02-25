---
layout: project
title: "PE-A (Analyzer) - PE 파일 분석 도구"
summary: "PE 파일 포맷을 분석하고 디지털 포렌식 분야에서 활용할 수 있는 올인원 도구입니다. 기능별로 파편화된 도구들을 통합하여 초보자도 손쉽게 PE 구조를 분석하고, 패킹 여부 검사, 헥스 편집, PDF 보고서 생성까지 지원합니다."
image: assets/images/mpw.jpg
technologies: [Python, PyQt5, Qt Designer, pefile, ReportLab]
github: https://github.com/ultisy/PE-A
categories: security
---

## 프로젝트 배경

기존 PE 분석 도구들은 기능별로 파편화되어 있어, 분석가가 여러 도구(PEview, HxD, Detect It Easy 등)를 오가며 작업해야 했습니다. 시스템 보안 프로젝트로, 이를 하나로 통합한 올인원 PE 분석 도구를 개발했습니다.

## 데모 영상

<video width="100%" controls>
  <source src="{{ site.baseurl }}/assets/videos/PE-A.mp4" type="video/mp4">
</video>

## 주요 기능

### 1. PE 헤더 파싱

DOS Header, NT Header (File Header + Optional Header), Section Header 정보를 `QTableWidget`으로 시각화한다. 각 필드의 원시 값과 의미를 함께 표시하여 PE 구조를 한눈에 파악할 수 있다.

| 영역 | 주요 필드 |
|------|-----------|
| DOS Header | `e_magic` (MZ 시그니처), `e_lfanew` (NT Header 오프셋) |
| NT Header | Machine, TimeDateStamp, AddressOfEntryPoint, ImageBase, SectionAlignment |
| Section Header | Name, VirtualAddress, SizeOfRawData, Characteristics |

### 2. 패킹 여부 검사

섹션 이름을 기반으로 UPX, ASPack, ASProtect, PECompact, Krypton 등 주요 패커 시그니처를 자동 탐지한다. 패킹 감지 시 빨간색 경고 메시지를 표시하여 언패킹 필요 여부를 즉시 안내한다.

### 3. Entry Point 상세 분석

EP Section, File Offset, First 16 Bytes, Linker Info, Subsystem (GUI/Console), Compiler Info를 별도 다이얼로그로 표시한다. EP 섹션의 첫 바이트를 통해 패킹 판별의 보조 지표를 확인할 수 있다.

### 4. 헥스 뷰어 & 에디터

바이너리 데이터를 `오프셋 | 헥스 값 | ASCII` 3단 형식으로 표시한다. **특정 바이트 패턴 검색**(예: `4D 5A`, `50 45`)과 **오프셋 지정 편집** (`file.seek()` → `file.write()`)을 지원하여, 별도 HxD 없이 바이너리 수정이 가능하다. PE 형식이 아닌 파일에서도 헥스 뷰어만은 정상 작동하도록 예외 분기를 구현했다.

### 5. PDF 분석 보고서 자동 생성

ReportLab으로 분석 결과를 PDF로 자동 출력한다. 작성 일시, DOS/NT/Section Header, 상세 정보, 컴파일러 참조표가 포함되며 한글 폰트(맑은 고딕)를 지원한다.

## 시스템 구조

```
main.py              — 진입점 (의존성 자동 설치 후 메인 윈도우 실행)
├── pe_viewer_2_4.py — 메인 UI (PE 헤더 파싱, 패킹 검사, 파일 선택)
├── detail.py        — Entry Point 상세 분석 다이얼로그
├── hex_viewer.py    — 헥스 뷰어/에디터 (검색·수정 기능)
└── pdf_sample.py    — PDF 보고서 생성 (한글 지원)
```

***

## 담당 업무

### 일정·리스크 관리

한정된 수업 일정 내에 4개 핵심 기능을 완성하기 위해 기능 간 의존 관계를 분석했다. 헥스 뷰어와 PDF 보고서는 헤더 파싱 결과에 의존하지 않으므로 **병렬 개발 구간**으로 식별하여 동시 진행했다. 개발 중반 `pefile.PEFormatError`가 전체 앱 안정성을 위협하는 리스크로 판단, 예외 처리를 최우선 과제로 격상하고 즉시 대응을 지시하여 프로그램 비정상 종료 없이 모든 바이너리를 다룰 수 있도록 했다.

### UI/UX 설계 (Qt Designer)

<img src="{{ site.baseurl}}/assets/images/UI.png" alt="UI/UX 디자인 설계" width="100%">

초보 분석가도 직관적으로 사용할 수 있는 원클릭 워크플로우를 목표로 Qt Designer에서 `.ui` 파일로 먼저 프로토타이핑했다.

- PEview·HxD·Detect It Easy의 화면 구성을 벤치마킹하여 **파일 선택 → 헤더 분석 → 상세 정보 → 헥스 뷰어 → PDF 보고서** 흐름을 단일 창에 구성
- 상세 정보·헥스 뷰어는 다중 창(QDialog)으로 분리하여 메인 화면 복잡도를 최소화
- 패킹 감지 시 빨간색 경고, 분석 단계별 버튼(Detail / HEX / PDF)을 상단 배치하여 자연스러운 이동 흐름 구성
- 팀원 피드백을 반영하여 레이아웃을 수정하고 최종 디자인 확정

### 헥스 뷰어 개발 (`hex_viewer.py`)

별도 헥스 에디터 없이 바이너리를 확인·수정할 수 있는 뷰어·에디터를 직접 구현했다.

- 파일을 바이너리 모드(`rb`)로 읽어 16바이트 단위로 파싱, 출력 불가능한 문자는 `.`으로 치환하여 가독성 확보
- 바이트 패턴 검색으로 MZ·PE 시그니처 오프셋을 즉시 확인 가능
- `file.seek()` → `file.write()`로 오프셋 지정 편집 구현 — 패킹 파일의 EP 바이트 수정, 섹션 헤더 Characteristics 변경 등을 별도 도구 없이 수행
- 비PE 파일 로드 시에도 헥스 뷰어만은 정상 작동하도록 예외 분기를 구현

### QA & 디버깅

기능 통합 과정에서 발생한 버그를 발견·수정하고, 회귀 방지를 위한 검증 시나리오를 반복 수행했다.

| 버그 | 원인 | 해결 |
|------|------|------|
| 섹션 이름 빈 셀 표시 | NULL 바이트 포함된 섹션 이름을 `decode` 없이 처리 | `decode('utf-8', errors='replace')` 적용 |
| PDF 한글 깨짐 | 환경별 맑은 고딕 폰트 경로 불일치 | 폰트 파일을 프로젝트에 포함하여 경로 의존성 제거 |
| `PEFormatError` 앱 전체 종료 | 예외 미처리 | try-except 블록으로 감싸 헥스 뷰어는 계속 사용 가능하도록 예외 흐름 설계 |

정상 실행 파일, UPX 패킹 파일, 비PE 파일을 포함한 다양한 샘플로 통합 검증 시나리오를 작성하고, 기능 통합 시마다 반복 수행하여 회귀 버그를 방지했다.

***

## 문제 해결 기록

### Problem 1. PE 포맷 오류 처리

**문제:** PE 형식이 아닌 파일(텍스트, 이미지 등)을 로드하면 `pefile.PEFormatError`가 발생하여 프로그램이 종료되었다.  
**해결:** 예외 처리로 경고 메시지를 표시하되, 헥스 뷰어로는 계속 접근 가능하도록 분기하여 모든 바이너리 파일을 분석할 수 있게 했다.

### Problem 2. 파편화된 도구 통합

**문제:** PEview, HxD, Detect It Easy, 보고서 도구를 각각 사용해야 하여 분석 흐름이 끊어졌다.  
**해결:** 단일 GUI에 전체 기능을 통합, 파일 로드 한 번으로 헤더 분석부터 PDF 보고서까지 원클릭으로 이어지는 워크플로우를 구현했다.

### Problem 3. 헥스 에디터 읽기 전용 한계

**문제:** 단순 헥스 뷰어는 읽기만 가능하여, 패킹 파일의 특정 바이트 수정 시 별도 에디터가 필요했다.  
**해결:** 오프셋 주소와 16진수 데이터를 입력하면 `file.seek()` → `file.write()`로 파일에 직접 반영되도록 편집 기능을 추가했다.

### Problem 4. 의존성 자동 관리

**문제:** PyQt5, pefile, reportlab 미설치 시 `ImportError`로 초보 사용자가 실행하지 못하는 문제가 있었다.  
**해결:** `main.py`에서 `__import__()`로 모듈 존재 여부를 확인하고, 없으면 `subprocess`로 pip 자동 설치를 수행하여 Python만 설치되어 있으면 바로 실행 가능하도록 했다.