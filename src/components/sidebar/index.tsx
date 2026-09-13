import { useState } from 'react';
import { Button, Input, Popconfirm, Tooltip } from 'antd';
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useChatStore } from '../../store/chat/chat.store';
import { deleteChat, renameChat } from '../../services/rest.service';
import './sidebar.scss';

interface SidebarProps {
    onNewChat: () => void;
}

export const Sidebar = ({ onNewChat }: SidebarProps) => {
    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setActiveConversation = useChatStore((state) => state.setActiveConversation);
    const renameConversation = useChatStore((state) => state.renameConversation);
    const deleteConversation = useChatStore((state) => state.deleteConversation);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const startRename = (id: string, currentName: string) => {
        setEditingId(id);
        setEditingName(currentName);
    };

    const confirmRename = async (id: string) => {
        const newName = editingName.trim();
        setEditingId(null);
        if (!newName) return;

        renameConversation(id, newName);
        try {
            await renameChat(id, { newName });
        } catch {
            // network errors are surfaced globally by the axios interceptor
        }
    };

    const handleDelete = async (id: string) => {
        deleteConversation(id);
        try {
            await deleteChat(id);
        } catch {
            // network errors are surfaced globally by the axios interceptor
        }
    };

    return (
        <aside className="chat-sidebar">
            <Button
                className="chat-sidebar__new-chat"
                type="primary"
                icon={<PlusOutlined />}
                onClick={onNewChat}
                block
            >
                New chat
            </Button>

            <ul className="chat-sidebar__list">
                {conversations.length === 0 && (
                    <li className="chat-sidebar__empty">No conversations yet</li>
                )}
                {conversations.map((conversation) => (
                    <li
                        key={conversation.id}
                        className={
                            'chat-sidebar__item' +
                            (conversation.id === activeConversationId ? ' chat-sidebar__item--active' : '')
                        }
                        onClick={() => setActiveConversation(conversation.id)}
                    >
                        {editingId === conversation.id ? (
                            <Input
                                autoFocus
                                size="small"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onPressEnter={() => confirmRename(conversation.id)}
                                onBlur={() => confirmRename(conversation.id)}
                                suffix={<CheckOutlined onClick={() => confirmRename(conversation.id)} />}
                            />
                        ) : (
                            <>
                                <span className="chat-sidebar__item-name">{conversation.name}</span>
                                <span className="chat-sidebar__item-actions" onClick={(e) => e.stopPropagation()}>
                                    <Tooltip title="Rename">
                                        <EditOutlined onClick={() => startRename(conversation.id, conversation.name)} />
                                    </Tooltip>
                                    <Popconfirm
                                        title="Delete this conversation?"
                                        onConfirm={() => handleDelete(conversation.id)}
                                    >
                                        <DeleteOutlined />
                                    </Popconfirm>
                                </span>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};
