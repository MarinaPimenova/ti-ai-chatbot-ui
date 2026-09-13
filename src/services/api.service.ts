import {protectedApi} from './axios.config';
import type {CancelSubscriptionsRequest, SseAnswerEvent} from "../interfaces/chat.interface.ts";
import {getServerUrl} from "./utils.service.ts";

const AI_ORCHESTRATOR_BASE = '/api/v1/ai-orchestrator';

// GET /rest/v1/ai-orchestrator/sse/question?conversationId=&questionId=
export const triggerAnswerProcessing = (conversationId: string, questionId: number) => {
    return protectedApi.get<void>(
        `${AI_ORCHESTRATOR_BASE}/sse/question`,
        { params: { conversationId, questionId } }
    );
};

// DELETE /rest/v1/ai-orchestrator/sse/subscription/{conversationId}/{questionId}
export const cancelSubscription = (conversationId: string, questionId: number) => {
    return protectedApi.delete<void>(
        `${AI_ORCHESTRATOR_BASE}/sse/subscription/${conversationId}/${questionId}`
    );
};

// POST /rest/v1/ai-orchestrator/sse/subscriptions/cancel
export const cancelSubscriptions = (payload: CancelSubscriptionsRequest) => {
    return protectedApi.post<void>(
        `${AI_ORCHESTRATOR_BASE}/sse/subscriptions/cancel`,
        payload
    );
};

export interface SseSubscriptionHandlers {
    onMessage: (data: SseAnswerEvent) => void;
    onError?: (event: Event) => void;
}

// GET /rest/v1/ai-orchestrator/sse/subscription/{conversationId}/{questionId} (text/event-stream)
// EventSource has no axios equivalent for streaming, so it talks to the same
// base URL (`ORIGINAL` cookie in prod, the Vite dev proxy locally) directly.
export const subscribeToAnswerStream = (
    conversationId: string,
    questionId: number,
    { onMessage, onError }: SseSubscriptionHandlers
): EventSource => {
    const baseUrl = getServerUrl('ORIGINAL');
    const url = `${baseUrl}${AI_ORCHESTRATOR_BASE}/sse/subscription/${conversationId}/${questionId}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
        try {
            onMessage(JSON.parse(event.data));
        } catch {
            onMessage({ content: event.data });
        }
    };

    if (onError) {
        eventSource.onerror = onError;
    }

    return eventSource;
};
