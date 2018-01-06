## 계산기 Front End 웹앱 구현

### 프로젝트 테스트 방법

production 파일 확인
1. git 에서 프로젝트 import (https://github.com/schang124/naverCalc.git)
2. /dist/index.html 실행

local dev server 확인
1. git 에서 프로젝트 import (https://github.com/schang124/naverCalc.git)
2. `yarn install`
3. `gulp serve`
4. http://localhost:3000 접속(3000 포트 사용중일 시 terminal 에 나오는 주소로 확인 후 이동)

### 제약 선택사항 중 구현한 것

#### FE
(선택) Grunt / Gulp 빌드를 사용


#### 마크업
(선택) 가능한한 모든 UI는 이미지 없이 CSS만으로 표현