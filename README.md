# Chat26

## About this project

The goal of this project is to build a simple full-stack chat app as a part of my personal portfolio. For this reason, there are a lot of different technologies at play here, many of which are likely overkill considering the size of the project. This is not meant to be an economically developed, viable app, but rather a vertical slice showcasing many different development skills I've acquired.

---

\
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)

## Run

### Dev

#### Frontend:

In `/frontend`, run

`npm i` (first time only)

`npm start`

Lint: `some-cmd-here`

#### Backend

In `/backend`, run

`typeshare --lang=typescript --output-file ../frontend/src/types/shared-types.ts .`
to generate type bindings (first time only), then run

`cargo run`

Lint: `some-cmd-here`

### Prod

- (to be added)

## Stack

### Frontend

- React with NextJS
- TypeScript
- Redux-Toolkit

### Backend

- Rust
  - `axum` for web server
    - `tungstenite-tokio` for WebSocket
  - `typeshare` for sharing type definitions from Rust to TypeScript
- MongoDB

### Other technolologies

- (to be added)

### Docker

- (to be added)
