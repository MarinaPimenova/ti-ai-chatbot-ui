import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Button, Empty, Spin, Tooltip } from 'antd';
import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import type { ChatMessage, Conversation } from '../../interfaces/chat.interface';
import { FeedbackType } from '../../services/feedback.enum';
import { submitFeedback } from '../../services/rest.service';
import { useChatStore } from '../../store/chat/chat.store';
import './chat-window.scss';

interface ChatWindowProps {
    conversation: Conversation | undefined;
    onStop: (messageId: string) => void;
}

const FeedbackActions = ({ conversation, message }: { conversation: Conversation; message: ChatMessage }) => {
    const updateMessage = useChatStore((state) => state.updateMessage);

    if (!message.questionId) return null;

    const sendFeedback = async (feedback: string) => {
        updateMessage(conversation.id, message.id, { feedback });
        try {
            await submitFeedback(conversation.id, { questionId: message.questionId!, feedback });
        } catch {
            // network errors are surfaced globally by the axios interceptor
        }
    };

    return (
        <div className="chat-message__feedback">
            <Tooltip title="Helpful">
                <LikeOutlined
                    className={message.feedback === FeedbackType.helpful ? 'chat-message__feedback--active' : ''}
                    onClick={() => sendFeedback(FeedbackType.helpful)}
                />
            </Tooltip>
            <Tooltip title="Not helpful">
                <DislikeOutlined
                    className={message.feedback === FeedbackType.notHelpful ? 'chat-message__feedback--active' : ''}
                    onClick={() => sendFeedback(FeedbackType.notHelpful)}
                />
            </Tooltip>
        </div>
    );
};

export const ChatWindow = ({ conversation, onStop }: ChatWindowProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages.length, conversation?.messages.at(-1)?.content]);

    return (
        <div className="chat-window">
            <div className="chat-window__header">Chat</div>
            <div className="chat-window__messages">
                {!conversation || conversation.messages.length === 0 ? (
                    <Empty description="Ask your first question to start the conversation" />
                ) : (
                    conversation.messages.map((message) => (
                        <div
                            key={message.id}
                            className={
                                'chat-message' +
                                (message.role === 'ai' ? ' chat-message--ai' : ' chat-message--user')
                            }
                        >
                            <span className="chat-message__author">{message.role === 'ai' ? 'AI' : 'User'}:</span>
                            <div className="chat-message__body">
                                {message.role === 'ai' ? (
                                    <Markdown>{message.content}</Markdown>
                                ) : (
                                    message.content
                                )}
                                {message.status === 'streaming' && (
                                    <span className="chat-message__streaming">
                                        <Spin size="small" />
                                        <Button size="small" type="link" onClick={() => onStop(message.id)}>
                                            Stop
                                        </Button>
                                    </span>
                                )}
                            </div>
                            {message.role === 'ai' && message.status === 'done' && (
                                <FeedbackActions conversation={conversation} message={message} />
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
