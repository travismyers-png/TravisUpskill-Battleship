import React from 'react';

export type MessagePanelProps = {
  message: string;
};

export default function MessagePanel({ message }: MessagePanelProps) {
  return (
    <div data-testid="message" className="message-bubble text-center text-lg font-semibold mb-4" title={message}>{message}</div>
  );
}
