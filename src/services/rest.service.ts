import { publicApi } from './axios.config';
import { getServerUrl } from './utils.service.ts';
import type {
    AskQuestionRequest,
    AskQuestionResponse,
    CancelSubscriptionsRequest,
    CreateChatRequest,
    FeedbackRequest,
    RenameChatRequest,
    SseAnswerEvent,
} from '../interfaces/chat.interface';

const AI_ORCHESTRATOR_BASE = '/rest/v1/ai-orchestrator';

// POST /rest/v1/ai-orchestrator/question?conversationId=
export const askQuestion = (conversationId: string, payload: AskQuestionRequest) => {
    return publicApi.post<AskQuestionResponse>(
        `${AI_ORCHESTRATOR_BASE}/question`,
        payload,
        { params: { conversationId } }
    );
};

// POST /rest/v1/ai-orchestrator/lp/chat?conversationId=
export const createChatAndStoreQuestion = (conversationId: string, payload: CreateChatRequest) => {
    return publicApi.post<string>(
        `${AI_ORCHESTRATOR_BASE}/lp/chat`,
        payload,
        { params: { conversationId } }
    );
};

// POST /rest/v1/ai-orchestrator/chat/name?conversationId=
export const renameChat = (conversationId: string, payload: RenameChatRequest) => {
    return publicApi.post<void>(
        `${AI_ORCHESTRATOR_BASE}/chat/name`,
        payload,
        { params: { conversationId } }
    );
};

// DELETE /rest/v1/ai-orchestrator/chat?conversationId=
export const deleteChat = (conversationId: string) => {
    return publicApi.delete<void>(
        `${AI_ORCHESTRATOR_BASE}/chat`,
        { params: { conversationId } }
    );
};

// POST /rest/v1/ai-orchestrator/feedback?conversationId=
export const submitFeedback = (conversationId: string, payload: FeedbackRequest) => {
    return publicApi.post<void>(
        `${AI_ORCHESTRATOR_BASE}/feedback`,
        payload,
        { params: { conversationId } }
    );
};
