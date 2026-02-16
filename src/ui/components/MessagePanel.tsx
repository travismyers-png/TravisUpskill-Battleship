import React from 'react';

export type MessagePanelProps = {
  message: string;
};

export default function MessagePanel({ message }: MessagePanelProps) {
  return (
    <div 
      key={message} 
      data-testid="message" 
      className="message-bubble text-center text-lg font-semibold mb-4"
      style={{
        animation: 'fadeIn 300ms ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {message}
    </div>
  );
}
