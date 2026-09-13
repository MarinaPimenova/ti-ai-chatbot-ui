Please scan this repository and do the following:

- generate `npm install <lib1> <lib2>`  to install all absent libraries.
- generate all code.

Maybe it makes sense to start from:
- generate layout and components according the following design:

```text
┌─────────────────────────────────────────      ┐ 
│       TI Knowledge Platform             User  │
├─────────────────────────────────────────      ┤
│       |                                        │
│       |Chat                                    │
│       |                                        │
│conv1  |AI: Hello!                              │
│conv2  |                                        │
│...    |User: What is dependency injection?     │
│       |                                        │
│       |AI: Dependency injection is...          │
│                                         │
│                                         │
│       ┌─────────────────────────────┐ [Send] │
│       │ Ask your question...        │         │
│       └─────────────────────────────┘         │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```
- generate content of `src/services/rest.service.ts` according to `below http requests`
- link actions in component with provided APIs in `src/services/rest.service.ts`
- generate interfaces for responses and payloads.

Please find below the examples of APIs spec:

## QuestionController

Class-level mapping: `/rest/v1`

| Action | Route or REST API | Request Payload / Response |
|---|---|---|
| Questions->Ask Question (unauthenticated) | POST `<server address>/rest/v1/ai-orchestrator/question?conversationId=abc-123` <br> Query params: `conversationId: string` | Req: `{ "question": "string" }` · Resp (HTTP 200): `{ "conversationId": "abc-123", "questionId": "string", "question": "string" }` |
| Questions->Submit Feedback | POST `<server address>/rest/v1/ai-orchestrator/feedback?conversationId=abc-123` <br> Query params: `conversationId: string` | Req: `{ "questionId": 123, "feedback": "string" }` · Resp: HTTP 200 (empty body, `ResponseEntity<Void>` via `ResponseEntity.ok().build()`) |

Note: a `GET /chats/{chatId}/questions` handler exists in this controller's source but is entirely commented out (`/* ... */`) and therefore not an active endpoint; it was excluded per the "only document what exists/executes" rule.

## SseController

Class-level mapping: `/rest/v1`

| Action | Route or REST API | Request Payload / Response |
|---|---|---|
| SSE->Subscribe to Question Stream (unauthenticated) | GET `<server address>/rest/v1/ai-orchestrator/sse/subscription/{conversationId}/{questionId}` <br> Path params: `conversationId: string`, `questionId: number` <br> Example: `/rest/v1/ai-orchestrator/sse/subscription/abc-123/456` | Cannot be determined from source code — method returns `SseEmitter` (`text/event-stream`), a streaming connection whose emitted event payloads are produced asynchronously by `SseService` and are not a single fixed JSON body. |
| SSE->Trigger Answer Processing | GET `<server address>/rest/v1/ai-orchestrator/sse/question?conversationId=abc-123&questionId=456` <br> Query params: `conversationId: string`, `questionId: number` | Resp: HTTP 200 (empty body, `ResponseEntity<Void>` via `ResponseEntity.ok().build()`) |
| SSE->Cancel Subscription | DELETE `<server address>/rest/v1/ai-orchestrator/sse/subscription/{conversationId}/{questionId}` <br> Path params: `conversationId: string`, `questionId: number` <br> Example: `/rest/v1/ai-orchestrator/sse/subscription/abc-123/456` | Req: none · Resp: HTTP 200 (empty body, `ResponseEntity<Void>` via `ResponseEntity.ok().build()` — not 204, per actual code) |
| SSE->Cancel Multiple Subscriptions | POST `<server address>/rest/v1/ai-orchestrator/sse/subscriptions/cancel` | Req: `{ "subscriptions": [ { "conversationId": "abc-123", "questionId": 456 } ] }` · Resp: HTTP 200 (empty body, `ResponseEntity<Void>` via `ResponseEntity.ok().build()`) |

## ChatController

Class-level mapping: `/rest/v1`

| Action | Route or REST API | Request Payload / Response |
|---|---|---|
| Chats->Create Chat and Store Question (unauthenticated) | POST `<server address>/rest/v1/ai-orchestrator/lp/chat?conversationId=abc-123` <br> Query params: `conversationId: string` | Req: `{ "question": "string" }` · Resp (HTTP 200, `text/plain` body): `"Ok"` |
| Chats->Rename Chat | POST `<server address>/rest/v1/ai-orchestrator/chat/name?conversationId=abc-123` <br> Query params: `conversationId: string` | Req: `{ "newName": "string" }` · Resp: HTTP 200 (empty body — method declares `ResponseEntity<String>` but returns `ResponseEntity.ok().build()`) |
| Chats->Delete Chat | DELETE `<server address>/rest/v1/ai-orchestrator/chat?conversationId=abc-123` <br> Query params: `conversationId: string` | Req: none · Resp: HTTP 200 (empty body — method declares `ResponseEntity<String>` but returns `ResponseEntity.ok().build()`) |


Please find below the examples of APIs calling in http format:
*http requests* :
```http request

### Ask a question — answer is produced async and delivered via the SSE subscription below
POST http://localhost:8085/rest/v1/question?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11
Content-Type: application/json
Accept: application/json

{
  "question": "What was our total revenue in Q2 2026?"
}

###

### Subscribe to the answer stream (Server-Sent Events)
GET http://localhost:8085/rest/v1/sse/subscription/c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11/10432
Accept: text/event-stream

###

### Trigger processing for an already-subscribed question
GET http://localhost:8085/rest/v1/sse/question?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11&questionId=10432
Accept: application/json

###

### Send feedback on an answer
POST http://localhost:8085/rest/v1/feedback?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11
Content-Type: application/json
Accept: application/json

{
  "questionId": 10432,
  "feedback": "helpful"
}

###

### Get list of chats
GET http://localhost:8085/rest/v1/chats
Accept: application/json

###
### Rename a chat
POST http://localhost:8085/rest/v1/chats/name?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11
Content-Type: application/json
Accept: application/json

{
  "newName": "Q2 Sales Analysis"
}

###

### Delete a chat
DELETE http://localhost:8085/rest/v1/chats?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11

###

```

- and finally generate README.md with last section about "how to run this microservice
  as standalone service" and taking into account the following:

- `src/services/rest.service.ts`
- and to have possibility to run it locally as one standalone microservice to check functionality
  so, please provide set http files for different cases.

As a result, we will have:
- No errors when `npm run dev` command is executed.
- the refactored `README.md` file:
1) structured sections such as: overview, Tech Stack & Key Technologies, Installation, Prerequisites, Available Scripts, Detailed Flow description, Run locally 
2) + "how to run locally and test functionality" - it should be complete guide like:
     -what standalone docker compose should be run - see the list in `/Users/Marina_Pimenova/ti-2026/ti-gateway-api/docker`
