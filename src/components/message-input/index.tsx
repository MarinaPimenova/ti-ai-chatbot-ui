import { useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './message-input.scss';

interface MessageInputProps {
    disabled?: boolean;
    onSend: (question: string) => void;
}

export const MessageInput = ({ disabled, onSend }: MessageInputProps) => {
    const [value, setValue] = useState('');

    const handleSend = () => {
        const question = value.trim();
        if (!question || disabled) return;
        onSend(question);
        setValue('');
    };

    return (
        <div className="message-input">
            <Input.TextArea
                className="message-input__textarea"
                placeholder="Ask your question..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                value={value}
                disabled={disabled}
                onChange={(e) => setValue(e.target.value)}
                onPressEnter={(e) => {
                    if (!e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={disabled || !value.trim()}
                onClick={handleSend}
            >
                Send
            </Button>
        </div>
    );
};
