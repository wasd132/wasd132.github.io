---
layout: project
title: "PE-A (Analyzer) - PE 파일 분석 도구"
summary: "PE뷰어 프로젝트입니다. 기능별로 파편화된 도구들을 통합하여 초보자도 손쉽게 파일 포멧을 분석할 수 있는 프로그램입니다."
image: assets/images/mpw.jpg
technologies: [Python, Qt Designer]
github: https://github.com/ultisy/PE-A
categories: security
---

## 프로젝트 배경

악성코드 분석의 첫 단계는 PE(Portable Executable) 파일의 구조를 파악하는 것입니다. 그러나 기존 PE 분석 도구들은 기능이 파편화되어 있어 초보 분석가가 접근하기 어렵습니다. 이를 통합한 올인원 PE 분석 도구를 개발했습니다.

## 주요 기능

- **PE 헤더 파싱**: DOS Header, PE Header, Section Header 등 PE 구조를 시각적으로 표시
- **Import/Export 테이블 분석**: 사용된 DLL과 함수 목록을 트리 구조로 탐색
- **엔트로피 분석**: 섹션별 엔트로피를 계산하여 패킹 여부 판별
- **헥스 뷰어**: 바이너리 데이터를 16진수로 조회

## 기술 스택 상세

### Python + pefile 라이브러리
- `pefile` 모듈을 활용하여 PE 구조를 파싱
- 섹션별 속성(읽기/쓰기/실행 권한) 분석

### Qt Designer (PyQt5)
- GUI 기반의 직관적인 사용자 인터페이스 설계
- 드래그 앤 드롭으로 파일 로드 지원
- 탭 기반 레이아웃으로 다양한 분석 정보를 한 화면에 제공

## 활용 사례

- 악성코드 초기 분석(Static Analysis) 시 PE 구조 파악
- CTF(Capture The Flag) 대회에서 리버싱 문제 풀이
- 보안 교육 시 PE 파일 포맷 학습 도구로 활용
