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

## How to Deploy

> 이 방식은 정식 CI/CD 방법이 정립되기 전까지 사용합니다.

배포에 앞서 먼저 빌드를 해줍니다.

```bash
  $ npm run build
```

빌드가 완료되면 루트 디렉토리 내에 `dist` 라는 이름의 폴더가 생성됩니다.

원격지에 접속해서 실행 환경 세팅을 해줍니다.

- apt-get update
  ```bash
    $ sudo apt-get update
  ```
- nvm install & node install
  ```bash
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  ```
- install node.js
  ```bash
    $ nvm install 16.13.2 #개발환경 노드 버전
  ```
- clone Git repository
  ```bash
    $ git clone http://~
  ```
- node dependency install & install pm2

  ```bash
    $ cd [project folder]
    $ npm install
    $ npm install -g pm2
  ```

- setting env file in ./bashrc
  ```bash
    $ vim(or vi) ~/.bashrc
  ```
  다음과 같이 `.bashrc` 파일의 맨 밑에 `export` 문을 이용하여 `.env` 파일에 있던 환경변수들을 생성해줍니다.
  ```bash
  # NestJS env list
  export DB_PORT=3306
  #...
  ```

실행환경 세팅이 완료되면 로컬로 돌아와서 `scp` 명령을 이용해 빌드 된 dist 폴더를 옮겨줍니다.

```bash
  $ scp -i ".pem file path" -r [옮기고 싶은 폴더] [username]@[host]:[서버 내 원하는 경로]
```

원격지에 접속해서 포트포워딩을 해주자 (80번을 NestJS 실행포트로)

```bash
  $ sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
```

옮긴 `dist` 폴더에 들어가서 실행

```bash
  $ node main.js
```
