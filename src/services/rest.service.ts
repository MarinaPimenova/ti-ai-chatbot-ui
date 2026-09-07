import { publicApi} from "./axios.config.ts";

const AI_ORCHESTRATOR_URL = '/rest/v1/ai-orchestrator/question?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11';
const AI_ORCHESTRATOR_SSE_SUBSCRIPTION_URL = '/rest/v1/ai-orchestrator/sse/subscription/c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11/10432';
const AI_ORCHESTRATOR_SSE_QUESTION_URL = '/rest/v1/ai-orchestrator/sse/question?conversationId=c3a1e9f0-1b2d-4a3c-9e21-8f9b3d5a7c11&questionId=10432';


export const askQuestion = (?) => {
    return publicApi.post<(AI_ORCHESTRATOR_URL, ?);
};

export const sseSubscription = () => {
    return publicApi.get<?>(
        AI_ORCHESTRATOR_SSE_SUBSCRIPTION_URL
    );
};

export const sseQuestion = () => {
    return publicApi.get<>(
        AI_ORCHESTRATOR_SSE_QUESTION_URL);
};

