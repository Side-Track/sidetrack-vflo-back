# sidetrack-vflo-back
## vflo 백엔드

Nest.js 로 작업 예정


# Nest.js Settings
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
# 환경 변수 적용을 위해 cross-env NODE_ENV=dev, test 설정되어있음
# package.json 변경됨 아래는 원본.
> "start:dev": "nest start --watch",
$ npm run start:dev

# production mode
# 환경변수는 아마존 서버 세팅되면 직접 넣음
# package.json 변경됨 아래는 원본.
> "start:prod": "node dist/main",
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```