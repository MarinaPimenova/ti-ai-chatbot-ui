export type ChatRole = 'user' | 'ai';

export type ChatMessageStatus = 'pending' | 'streaming' | 'done' | 'error';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    questionId?: number;
    status: ChatMessageStatus;
    feedback?: string;
}

export interface Conversation {
    id: string;
    name: string;
    createdAt: number;
    messages: ChatMessage[];
}

// POST /rest/v1/ai-orchestrator/question?conversationId=
export interface AskQuestionRequest {
    question: string;
}

export interface AskQuestionResponse {
    conversationId: string;
    questionId: string;
    question: string;
}

// POST /rest/v1/ai-orchestrator/feedback?conversationId=
export interface FeedbackRequest {
    questionId: number;
    feedback: string;
}

// POST /rest/v1/ai-orchestrator/lp/chat?conversationId=
export interface CreateChatRequest {
    question: string;
}

// POST /rest/v1/ai-orchestrator/chat/name?conversationId=
export interface RenameChatRequest {
    newName: string;
}

export interface SubscriptionRef {
    conversationId: string;
    questionId: number;
}

// POST /rest/v1/ai-orchestrator/sse/subscriptions/cancel
export interface CancelSubscriptionsRequest {
    subscriptions: SubscriptionRef[];
}

// Undocumented in backend source (SseEmitter payload produced async by
// SseService) — modeled defensively, parsed best-effort per SSE message.
export interface SseAnswerEvent {
    content?: string;
    done?: boolean;
    [key: string]: unknown;
}
