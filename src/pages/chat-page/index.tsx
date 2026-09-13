import { useEffect, useRef } from 'react';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { Sidebar } from '../../components/sidebar';
import { ChatWindow } from '../../components/chat-window';
import { MessageInput } from '../../components/message-input';
import { useChatStore } from '../../store/chat/chat.store';
import {
    askQuestion,
    createChatAndStoreQuestion,

} from '../../services/rest.service';
import {
    cancelSubscription,
    cancelSubscriptions,
    subscribeToAnswerStream,
    triggerAnswerProcessing,
} from '../../services/api.service';
import type { ChatMessage } from '../../interfaces/chat.interface';
import './chat-page.scss';

interface ActiveSubscription {
    conversationId: string;
    questionId: number;
    eventSource: EventSource;
}

export const ChatPage = () => {
    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const createConversation = useChatStore((state) => state.createConversation);
    const setActiveConversation = useChatStore((state) => state.setActiveConversation);
    const appendMessage = useChatStore((state) => state.appendMessage);
    const updateMessage = useChatStore((state) => state.updateMessage);
    const appendToMessageContent = useChatStore((state) => state.appendToMessageContent);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    const isAwaitingAnswer = activeConversation?.messages.some((m) => m.status === 'pending' || m.status === 'streaming') ?? false;

    const activeSubscriptions = useRef(new Map<string, ActiveSubscription>());

    useEffect(() => {
        return () => {
            const subscriptions = Array.from(activeSubscriptions.current.values());
            subscriptions.forEach(({ eventSource }) => eventSource.close());
            if (subscriptions.length > 0) {
                cancelSubscriptions({
                    subscriptions: subscriptions.map(({ conversationId, questionId }) => ({ conversationId, questionId })),
                }).catch(() => {});
            }
        };
    }, []);

    const stopStreaming = (messageId: string) => {
        const subscription = activeSubscriptions.current.get(messageId);
        if (!subscription) return;

        subscription.eventSource.close();
        activeSubscriptions.current.delete(messageId);
        cancelSubscription(subscription.conversationId, subscription.questionId).catch(() => {});
        updateMessage(subscription.conversationId, messageId, { status: 'done' });
    };

    const handleSend = async (question: string) => {
        let conversationId = activeConversationId;
        const isNewConversation = !conversationId;

        if (!conversationId) {
            conversationId = crypto.randomUUID();
            createConversation(conversationId, question.length > 40 ? `${question.slice(0, 40)}...` : question);
        }

        const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: question, status: 'done' };
        appendMessage(conversationId, userMessage);

        const aiMessageId = crypto.randomUUID();
        appendMessage(conversationId, { id: aiMessageId, role: 'ai', content: '', status: 'pending' });

        try {
            if (isNewConversation) {
                // Registers the chat itself; only askQuestion below returns the
                // questionId needed to open the SSE subscription (see README).
                createChatAndStoreQuestion(conversationId, { question }).catch(() => {});
            }

            const { data } = await askQuestion(conversationId, { question });
            const questionId = Number(data.questionId);
            updateMessage(conversationId, aiMessageId, { questionId, status: 'streaming' });

            const eventSource = subscribeToAnswerStream(conversationId, questionId, {
                onMessage: (event) => {
                    if (typeof event.content === 'string' && event.content) {
                        appendToMessageContent(conversationId!, aiMessageId, event.content);
                    }
                    if (event.done) {
                        activeSubscriptions.current.delete(aiMessageId);
                        eventSource.close();
                        updateMessage(conversationId!, aiMessageId, { status: 'done' });
                    }
                },
                onError: () => {
                    activeSubscriptions.current.delete(aiMessageId);
                    eventSource.close();
                    updateMessage(conversationId!, aiMessageId, { status: 'error' });
                },
            });

            activeSubscriptions.current.set(aiMessageId, { conversationId, questionId, eventSource });

            await triggerAnswerProcessing(conversationId, questionId);
        } catch {
            updateMessage(conversationId, aiMessageId, {
                status: 'error',
                content: 'Something went wrong while asking this question. Please try again.',
            });
        }
    };

    return (
        <div className="chat-page">
            <Header />
            <div className="chat-page__body">
                <Sidebar onNewChat={() => setActiveConversation(null)} />
                <div className="chat-page__main">
                    <ChatWindow conversation={activeConversation} onStop={stopStreaming} />
                    <MessageInput disabled={isAwaitingAnswer} onSend={handleSend} />
                </div>
            </div>
            <Footer />
        </div>
    );
};
