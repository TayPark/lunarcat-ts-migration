# lunarcat-ts-migration

ES6로 작성된 NodeJS 루나캣 프로젝트를 TS로 마이그레이션 하는 레포입니다.

## 타입스크립트 도입

## 종속성 약화를 위한 DI, IoC, Repository pattern 도입

- DI: 종속성 주입. 상위 클래스 constructor의 멤버변수를 초기화 할 때 하위 클래스를 parameter로 받아 사용하는 방식. 이 때 parameter를 다르게 주면 다른 기능을 가지는 클래스를 구현할 수 있다.
- IoC: 제어의 역전. 상위 클래스에 의존성을 주입했기 때문에 하위 클래스에서 상위 클래스를 사용하는 느낌을 가짐
- Repository pattern: 데이터 저장소를 여러 곳을 두어 상황에 맞게 사용할 수 있는 디자인 패턴.

## file rotate logging

최대 30일간 하루마다 파일을 바꿔가며 로깅한다. 지난 파일은 압축된다.

## 종속성 약화를 위해 기존 코드 라이브러리 또는 config화

에러 미들웨어, apiDocs config, database, httpException 등

## Env 검사 로직 추가

서버 시작과 동시에 .env의 값에 대한 타입검사 및 유무 검사