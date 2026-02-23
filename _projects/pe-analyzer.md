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

### 1. PE 헤더 파싱
DOS Header, NT Header(File Header + Optional Header), Section Header 정보를 `QTableWidget` 테이블로 시각화합니다. 각 필드의 실제 값과 의미를 함께 표시하여 PE 구조를 한눈에 파악할 수 있습니다.
- **DOS Header**: `e_magic`(MZ 시그니처), `e_lfanew`(NT Header 오프셋)
- **NT Header**: Machine(CPU 아키텍처), TimeDateStamp(컴파일 일시), AddressOfEntryPoint, ImageBase, SectionAlignment 등
- **Section Header**: 각 섹션의 Name, VirtualAddress, SizeOfRawData, Characteristics

### 2. 패킹 여부 검사
섹션 이름을 기반으로 UPX, ASPack, ASProtect, PECompact, Krypton 등 주요 패커의 시그니처를 자동 탐지합니다. 패킹이 감지되면 경고 메시지를 표시하여 추가 분석(언패킹) 필요 여부를 안내합니다.

### 3. 상세 정보 분석
Entry Point, EP Section, File Offset, First 16 Bytes, Linker Info, Subsystem(GUI/Console), Compiler Info를 별도 다이얼로그로 표시합니다. EP 섹션의 첫 바이트를 확인하여 패킹 판별의 보조 지표로 활용할 수 있습니다.

### 4. 헥스 뷰어 & 에디터
바이너리 데이터를 `오프셋 | 헥스 값 | ASCII` 형식으로 표시하며, 특정 헥스 값 검색과 오프셋 지정 편집을 지원합니다. 수정된 데이터는 파일에 직접 반영되어 별도의 헥스 에디터 없이도 바이너리 수정이 가능합니다.

### 5. PDF 분석 보고서 생성
ReportLab을 사용하여 분석 결과를 PDF로 자동 생성합니다. 작성일시, DOS/NT/Section Header 분석 결과, Detail 정보, 컴파일러 참조표가 포함되며 한글 폰트(맑은 고딕)를 지원합니다.

## 시스템 구조

```
main.py              — 진입점 (의존성 자동 설치 후 메인 윈도우 실행)
├── pe_viewer_2_4.py — 메인 UI (PE 헤더 파싱, 패킹 검사, 파일 선택)
├── detail.py        — Entry Point 상세 분석 다이얼로그
├── hex_viewer.py    — 헥스 뷰어/에디터 (검색·수정 기능)
└── pdf_sample.py    — PDF 보고서 생성 (한글 지원)
```

## 기술 스택

- **Python + pefile** — PE 구조 파싱 (DOS/NT/Optional/Section Header, 섹션 권한 분석, `struct` 모듈로 바이너리 언패킹)
- **PyQt5 + Qt Designer** — GUI 데스크톱 앱 (`QMainWindow` + `QDialog` 다중 창, `QTableWidget` 테이블 표시, `QFileDialog` 파일 선택)
- **ReportLab** — PDF 보고서 자동 생성 (한글 폰트 지원, 구조화된 분석 보고서 출력)

## 문제 해결 과정

### 1. PE 포맷 오류 처리
**문제**: PE 형식이 아닌 파일(텍스트, 이미지 등)을 로드하면 `pefile.PEFormatError`가 발생하여 프로그램이 종료되었습니다.<br>
**해결**: 예외 처리로 경고 메시지를 표시하되, "HEX 값은 확인 가능합니다"라는 안내와 함께 헥스 뷰어로는 접근 가능하도록 처리하여 비PE 바이너리도 분석할 수 있게 했습니다.

### 2. 파편화된 분석 도구 통합
**문제**: PE 구조 분석(PEview), 헥스 편집(HxD), 패킹 검사(Detect It Easy), 보고서 작성을 각각 다른 도구로 수행해야 하여 분석 흐름이 끊어졌습니다.<br>
**해결**: 하나의 GUI에 모든 기능을 통합하여 파일 로드 한 번으로 헤더 분석 → 상세 정보 → 헥스 뷰어 → PDF 보고서까지 원클릭으로 접근할 수 있는 워크플로우를 구현했습니다.

### 3. 헥스 에디터 구현
**문제**: 단순 헥스 뷰어는 읽기만 가능하여, 패킹된 파일의 특정 바이트를 수정하려면 별도의 헥스 에디터가 필요했습니다.<br>
**해결**: 오프셋 주소와 16진수 데이터를 입력하면 `file.seek()` → `file.write()`로 파일에 직접 반영되도록 편집 기능을 추가하여, 뷰어와 에디터를 하나의 창에서 처리할 수 있게 했습니다.

### 4. 의존성 자동 관리
**문제**: PyQt5, pefile, reportlab 등 외부 라이브러리 미설치 시 ImportError로 초보 사용자가 실행하지 못하는 문제가 있었습니다.<br>
**해결**: `main.py`에서 `__import__()`로 모듈 존재 여부를 확인하고, 없으면 `subprocess`로 pip 자동 설치를 수행하여 Python만 설치되어 있으면 바로 실행 가능하도록 했습니다.
