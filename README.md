# sidetrack-vflo-back - vflo 백엔드


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
$ npm run start:dev

# production mode
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

## Note

- 현재 env(환경변수) 동적 적용을 위해 cross-env 가 적용되어 있음.
- 환경 변수 사용을 위해 윈도우 사용자는 `win-node-env` 모듈 전역 설치 후 작업
  > npm install -g win-node-env
- 실제 production 모드에서는 실제 AWS or Cloudflare 등에 직접 환경변수 적용 후 사용 예정