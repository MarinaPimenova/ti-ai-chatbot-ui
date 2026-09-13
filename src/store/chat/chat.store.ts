import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Conversation } from '../../interfaces/chat.interface';

export interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    createConversation: (id: string, name: string) => void;
    renameConversation: (id: string, name: string) => void;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string | null) => void;
    appendMessage: (conversationId: string, message: ChatMessage) => void;
    updateMessage: (
        conversationId: string,
        messageId: string,
        patch: Partial<Pick<ChatMessage, 'content' | 'status' | 'questionId' | 'feedback'>>
    ) => void;
    appendToMessageContent: (conversationId: string, messageId: string, chunk: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            activeConversationId: null,

            createConversation: (id, name) => {
                const conversation: Conversation = { id, name, createdAt: Date.now(), messages: [] };
                set({
                    conversations: [conversation, ...get().conversations],
                    activeConversationId: id,
                });
            },

            renameConversation: (id, name) => {
                set({
                    conversations: get().conversations.map((c) => (c.id === id ? { ...c, name } : c)),
                });
            },

            deleteConversation: (id) => {
                const remaining = get().conversations.filter((c) => c.id !== id);
                const { activeConversationId } = get();
                set({
                    conversations: remaining,
                    activeConversationId:
                        activeConversationId === id ? (remaining[0]?.id ?? null) : activeConversationId,
                });
            },

            setActiveConversation: (id) => set({ activeConversationId: id }),

            appendMessage: (conversationId, message) => {
                set({
                    conversations: get().conversations.map((c) =>
                        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
                    ),
                });
            },

            updateMessage: (conversationId, messageId, patch) => {
                set({
                    conversations: get().conversations.map((c) =>
                        c.id === conversationId
                            ? {
                                  ...c,
                                  messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
                              }
                            : c
                    ),
                });
            },
            appendToMessageContent: (conversationId, messageId, chunk) => {
                set({
                    conversations: get().conversations.map((c) =>
                        c.id === conversationId
                            ? {
                                  ...c,
                                  messages: c.messages.map((m) =>
                                      m.id === messageId ? { ...m, content: m.content + chunk } : m
                                  ),
                              }
                            : c
                    ),
                });
            },
        }),
        { name: 'ti-ai-chatbot-conversations' }
    )
);
