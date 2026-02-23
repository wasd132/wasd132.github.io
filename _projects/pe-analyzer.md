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

기존 PE 분석 도구들은 기능별로 파편화되어 있어, 분석가가 여러 도구(PEview, HxD, Detect It Easy 등)를 오가며 작업해야 했습니다. 시스템 보안 수업 프로젝트로, 이를 하나로 통합한 올인원 PE 분석 도구를 개발했습니다.

## 데모 영상

<video width="100%" controls>
  <source src="{{ site.baseurl }}/assets/videos/PE-A.mp4" type="video/mp4">
</video>

## 주요 기능

| 기능 | 설명 |
|------|------|
| **PE 헤더 파싱** | DOS Header, NT Header, Section Header를 테이블로 시각화 |
| **패킹 검사** | UPX, ASPack 등 주요 패커 시그니처 자동 탐지 |
| **상세 분석** | Entry Point, EP Section, File Offset, 컴파일러 정보 표시 |
| **헥스 뷰어/에디터** | 바이너리를 16진수·ASCII로 조회하고 오프셋 기반 직접 편집 지원 |
| **PDF 보고서** | 분석 결과를 구조화된 PDF로 자동 생성 (한글 지원) |

## 시스템 구조

```
main.py              — 진입점 (모듈 자동 설치 포함)
├── pe_viewer_2_4.py — 메인 UI, PE 헤더 파싱, 패킹 검사
├── detail.py        — Entry Point 상세 분석 다이얼로그
├── hex_viewer.py    — 헥스 뷰어/에디터
└── pdf_sample.py    — PDF 보고서 생성
```

## 기술 스택

- **Python + pefile** — PE 구조 파싱 (DOS/NT/Section Header, 섹션 권한 분석)
- **PyQt5 + Qt Designer** — GUI 데스크톱 앱 (QMainWindow + QDialog 다중 창 구조)
- **ReportLab** — PDF 보고서 생성 (한글 폰트 지원)

## 문제 해결 과정

### 1. PE 포맷 오류 처리
PE 형식이 아닌 파일 로드 시 프로그램이 종료되는 문제를 예외 처리로 해결했습니다. 파싱 실패 시 경고를 표시하되, 헥스 뷰어로는 접근 가능하도록 하여 비PE 바이너리도 분석할 수 있게 했습니다.

### 2. 파편화된 도구 통합
PE 분석, 헥스 편집, 패킹 검사, 보고서 작성을 하나의 GUI에 통합하여 파일 로드 한 번으로 모든 기능에 접근할 수 있는 워크플로우를 구현했습니다.

### 3. 헥스 에디터 구현
뷰어에 편집 기능을 추가하여, 오프셋 주소와 16진수 데이터를 입력하면 `file.seek()` → `file.write()`로 파일에 직접 반영되도록 구현했습니다.

### 4. 의존성 자동 관리
실행 시 PyQt5, pefile, reportlab을 `__import__()`로 확인하고, 미설치 시 pip 자동 설치를 수행하여 Python만 있으면 바로 실행 가능하도록 했습니다.
