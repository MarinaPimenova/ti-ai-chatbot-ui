# ti-ai-chatbot-ui

A single-page chat UI for the TI Knowledge Platform's AI assistant. Users ask questions in natural language and get answers streamed back over Server-Sent Events (SSE), with a sidebar of past conversations, chat rename/delete, and per-answer feedback.

## Overview

The app is a thin client over the **ai-orchestrator** service, reached through the **ti-gateway-api** gateway (see [Run locally end-to-end](#run-locally-end-to-end-standalone-to-test-functionality) below). It does not do its own authentication — every endpoint it calls is unauthenticated by design (`QuestionController`, `SseController`, `ChatController`).

Conversation flow:
1. The user types a question and hits **Send**.
2. The UI calls `POST /rest/v1/ai-orchestrator/question` with a client-generated `conversationId`, gets back a `questionId`.
3. The UI opens an SSE subscription for that `conversationId`/`questionId` and calls the "trigger processing" endpoint, then renders the streamed answer as it arrives.
4. The user can give thumbs-up/down feedback on any answer, or rename/delete a conversation from the sidebar.

There is no backend endpoint to list existing chats, so the **conversation list lives entirely on the client** (`zustand` + `localStorage`) and is populated as chats are created, renamed, or deleted through the real endpoints.

## Tech Stack & Key Technologies

| Purpose               | Library                                    |
|------------------------|---------------------------------------------|
| UI framework           | React 19 + TypeScript                       |
| Build tool              | Vite 8 (`@vitejs/plugin-react`, `vite-plugin-svgr` for `?react` SVG imports) |
| Component library       | antd 6 + `@ant-design/icons`                |
| HTTP client             | axios                                       |
| Client state            | zustand (with the `persist` middleware for the conversation list) |
| Realtime answer delivery | native browser `EventSource` (Server-Sent Events) |
| Markdown rendering      | react-markdown (AI answers)                 |
| Utilities               | lodash                                      |
| Styling                 | Sass (`.scss` per component)                |

## Prerequisites

- Node.js 20+ and npm
- A running backend to talk to (see [Run locally end-to-end](#run-locally-end-to-end-standalone-to-test-functionality)) — without it the UI still loads and renders, it just shows a "can't reach the server" notification when you try to send a message.

## Installation

```shell
npm install
```

## Available Scripts

| Script            | Description                                             |
|-------------------|----------------------------------------------------------|
| `npm run dev`     | Starts the Vite dev server on `http://localhost:7000/chat` with a proxy that forwards `/rest/**` to the local gateway at `http://localhost:8080` |
| `npm run build`   | Type-checks (`tsc -b`) and builds the production bundle to `dist/` |
| `npm run preview` | Serves the production build locally                      |
| `npm run lint`    | Runs ESLint over the project                              |

## Detailed Flow description

### Asking a question

| Step | Call | Notes |
|---|---|---|
| 1 | `askQuestion(conversationId, { question })` → `POST /rest/v1/ai-orchestrator/question?conversationId=` | Returns `{ conversationId, questionId, question }`. This is the only call that returns a `questionId`, so it happens for every message, first or not. |
| 2 | (first message of a new chat only) `createChatAndStoreQuestion(conversationId, { question })` → `POST /rest/v1/ai-orchestrator/lp/chat?conversationId=` | Fire-and-forget: registers the chat itself. It returns a plain `"Ok"` string with no `questionId`, so it can't drive the SSE flow on its own — it runs alongside step 1, not instead of it. |
| 3 | `subscribeToAnswerStream(conversationId, questionId)` → `GET /rest/v1/ai-orchestrator/sse/subscription/{conversationId}/{questionId}` (`text/event-stream`) | Opens a native `EventSource`. The emitted event payload shape isn't documented in the backend source, so the client parses each message as JSON best-effort and falls back to treating it as a raw text chunk (`{ content, done }` is the assumed shape — adjust `subscribeToAnswerStream` in `rest.service.ts` once the real payload is confirmed). |
| 4 | `triggerAnswerProcessing(conversationId, questionId)` → `GET /rest/v1/ai-orchestrator/sse/question?conversationId=&questionId=` | Tells the backend to start producing the answer now that a subscriber is listening. |
| 5 | UI appends each streamed chunk to the AI message bubble, marks it `done` when the stream signals completion or errors it otherwise. |

Closing a subscription early (the **Stop** link under a streaming answer, or leaving the page) calls `cancelSubscription` (single) or `cancelSubscriptions` (batch, on unmount) so the backend can free the emitter — `DELETE`/`POST /rest/v1/ai-orchestrator/sse/subscription(s)/...`.

### Feedback

Thumbs-up/down under a completed AI answer call `submitFeedback(conversationId, { questionId, feedback })` → `POST /rest/v1/ai-orchestrator/feedback?conversationId=`.

### Chat management (sidebar)

- **Rename** (pencil icon) → `renameChat(conversationId, { newName })` → `POST /rest/v1/ai-orchestrator/chat/name?conversationId=`
- **Delete** (trash icon) → `deleteChat(conversationId)` → `DELETE /rest/v1/ai-orchestrator/chat?conversationId=`

All of the above are implemented in [`src/services/rest.service.ts`](src/services/rest.service.ts), typed against [`src/interfaces/chat.interface.ts`](src/interfaces/chat.interface.ts).

## Project Structure

```
src/
  components/
    header/          top bar: logo, title, network-error banner, user label
    footer/          bottom bar
    sidebar/         conversation list, new chat, rename/delete
    chat-window/      message transcript, markdown rendering, feedback, stop
    message-input/    question textarea + Send button
    interceptor/      wires the antd notification API into the axios error interceptor
  pages/
    chat-page/        assembles header + sidebar + chat-window + message-input + footer
  services/
    rest.service.ts   typed REST + SSE calls to the ai-orchestrator API (via gateway)
    axios.config.ts   axios instances + global error/network handling
  store/
    chat/             conversations + messages (zustand, persisted to localStorage)
    network/          global "backend unreachable" flag
  interfaces/          request/response/domain types
```

## Run locally

```shell
npm install
npm run dev
```

Open `http://localhost:7000/chat`. The layout renders even with no backend running; sending a question will show a "can't reach the server" notification instead of an answer until a backend is available (see below).

In production, the API base URL is read from a cookie named `ORIGINAL` (see `getServerUrl` in `src/services/utils.service.ts`) — that's set by the hosting environment. Locally, `vite.config.ts` instead proxies `/rest/**` to `http://localhost:8080` so no manual cookie setup is needed.

## Run locally end-to-end (standalone) to test functionality

This app is one of many microservices in the platform (see the naming convention and service list in `ti-gateway-api/docker/README.md`). To exercise the full flow — ask a question and see a real streamed answer — you need the gateway, the ai-orchestrator service, and their infrastructure running alongside this UI.

### 1. Start infrastructure

From `ti-gateway-api/docker`:

```shell
docker compose -f docker-compose-infra.yml --env-file env up -d
```

This brings up (per that compose file): `redis` (6379), `rabbitmq` (5672/15672), `ti-knowledge-db` (5432), `ti-document-db` (5433), `ti-assistant-db` (5434), plus the observability stack (`prometheus` 9090, `loki` 3100, `grafana` 3000, `zipkin` 9411, `alloy`). Configure the `env` file first per that repo's `env.example`.

### 2. Start the backend services

Run these from their own repos/IDE (per `ti-gateway-api/docker/README.md`):
- `ti-gateway-api` — the gateway, listens on **`:8080`**. This is what the UI talks to.
- `ti-ai-orchestrator-api` — the ai-orchestrator service, listens on **`:8085`** (`AI_ORCHESTRATOR_SERVICE_PORT` in `env.example`). The gateway forwards `/rest/v1/ai-orchestrator/**` here.

Verify the gateway is up: `http://localhost:8080/version`.

### 3. Start this UI

```shell
npm install
npm run dev
```

Open `http://localhost:7000/chat` — the dev proxy already forwards `/rest/**` to `http://localhost:8080`, so no extra configuration is needed. Ask a question and confirm the answer streams in.

### 4. Exercise each endpoint independently with `.http` files

The [`http/`](http) directory (already excluded from the Docker image build context by `.dockerignore`) has one request per endpoint, ready to run with the IntelliJ HTTP Client or VS Code REST Client extension, targeting the gateway on `:8080`:

| File | Endpoint |
|---|---|
| `http/ask-question.http` | Ask a question |
| `http/create-chat.http` | Create chat + store first question (`lp/chat`) |
| `http/sse-subscribe.http` | Subscribe to the answer stream |
| `http/sse-trigger.http` | Trigger answer processing |
| `http/sse-cancel.http` | Cancel a single subscription |
| `http/sse-cancel-multiple.http` | Cancel multiple subscriptions |
| `http/feedback.http` | Submit feedback |
| `http/rename-chat.http` | Rename a chat |
| `http/delete-chat.http` | Delete a chat |

`http/http-client.env.json` defines a `local` environment (`gatewayUrl`, `aiOrchestratorUrl`, `conversationId`, `questionId`) — select it in your editor's HTTP client before running any request.

Typical manual test sequence: run `ask-question.http` → copy the returned `questionId` into the environment (or paste it directly into `sse-subscribe.http`) → open it (streams until closed) → in another tab, run `sse-trigger.http` with the same ids → watch the answer arrive on the subscription tab → run `feedback.http` with the same `questionId`.

Each file also has a commented-out alternate request pointing at the ai-orchestrator service directly on `:8085` (bypassing the gateway, using the unprefixed paths), for isolating whether an issue is in the gateway routing or in the ai-orchestrator service itself.
