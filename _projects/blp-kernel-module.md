---
layout: project
title: "접근통제 정책 집행을 위한 리눅스 커널 모듈 개발"
summary: "BLP모델을 기반으로 한 리눅스 보안 모듈입니다. 사용자의 보안레벨에 따라 파일의 읽기/쓰기 접근을 커널 수준에서 제어합니다."
image: assets/images/s3scan.png
technologies: [C, Python, Linux]
github:
categories: security
---

## 프로젝트 배경

정보보안에서 MAC(Mandatory Access Control)은 기밀성 보장을 위한 핵심 메커니즘입니다. Bell-LaPadula(BLP) 모델은 군사급 기밀성을 보장하는 대표적인 접근통제 모델이며, 이를 리눅스 커널 모듈로 직접 구현하여 실습 및 연구 목적으로 활용할 수 있도록 개발했습니다.

## 주요 기능

- **BLP 모델 구현**: "No Read Up, No Write Down" 원칙을 커널 수준에서 강제
- **보안 레벨 관리**: 사용자와 파일(객체)에 보안 등급(Unclassified, Confidential, Secret, Top Secret)을 부여
- **커널 훅 기반 접근 제어**: 파일 시스템 접근 시 커널 레벨에서 권한 검증 수행
- **관리 유틸리티**: Python 기반 CLI 도구로 보안 레벨 설정 및 조회

## 기술 스택 상세

### C - Linux Kernel Module
- LSM(Linux Security Module) 프레임워크를 활용한 보안 모듈 작성
- VFS(Virtual File System) 레이어의 훅 포인트에서 접근 제어 로직 실행
- `inode` 보안 속성에 보안 레벨을 저장하여 영속적 관리

### Python - 관리 유틸리티
- 사용자 보안 레벨 설정/조회 CLI 도구
- 접근 시도 로그 분석 및 시각화

## BLP 모델 동작 원리

1. **Simple Security Property (No Read Up)**: 주체는 자신의 보안 등급보다 높은 객체를 읽을 수 없음
2. **Star Property (No Write Down)**: 주체는 자신의 보안 등급보다 낮은 객체에 쓸 수 없음
3. **Strong Star Property**: 주체는 자신과 동일한 등급의 객체에만 읽기/쓰기 가능
