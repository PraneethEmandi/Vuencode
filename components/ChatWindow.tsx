
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from './Icons';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isReady: boolean;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === Role.MODEL;

  return (
    <div className={`flex items-start gap-3 ${!isModel && 'justify-end'}`}>
      {isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
      )}
      <div 
        className={`p-4 rounded-lg max-w-lg whitespace-pre-wrap ${
          isModel ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white'
        }`}
      >
        {message.content}
      </div>
      {!isModel && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
          <UserCircleIcon className="w-6 h-6 text-gray-300" />
        </div>
      )}
    </div>
  );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, isReady }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col shadow-lg h-full">
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
             <SparklesIcon className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold">Vision Agent Chat</h3>
            <p>Your video analysis will appear here.</p>
            <p className="text-sm mt-2">Upload a video and click "Start Analysis" to begin.</p>
          </div>
        ) : (
          messages.map((msg, index) => <ChatMessage key={index} message={msg} />)
        )}
         {isLoading && messages.length > 0 && messages[messages.length-1].role === Role.USER && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-lg bg-gray-700 text-gray-200">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isReady ? "Ask a follow-up question..." : "Start analysis to enable chat"}
            className="flex-1 bg-gray-700 rounded-lg p-2 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            rows={1}
            disabled={!isReady || isLoading}
          />
          <button
            type="submit"
            disabled={!isReady || isLoading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon />
          </button>
        </form>
      </div>
    </div>
  );
};
