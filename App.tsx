
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VideoInput } from './components/VideoInput';
import { ChatWindow } from './components/ChatWindow';
import { streamChat, resetChat } from './services/geminiService';
import type { Message } from './types';
import { Role } from './types';

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasStartedAnalysis = useRef(false);

  const handleSendMessage = useCallback(async (messageText: string, fileForAnalysis?: File) => {
    if (isLoading) return;
    
    if (fileForAnalysis) {
        setIsAnalyzing(true);
    }
    setIsLoading(true);
    setError(null);
    
    const userMessage: Message = { role: Role.USER, content: messageText };

    setMessages(prev => {
        const newMessages = fileForAnalysis ? [userMessage] : [...prev, userMessage];
        return [...newMessages, { role: Role.MODEL, content: '...' }];
    });

    let fullResponse = "";
    
    try {
      const stream = streamChat(messageText, fileForAnalysis);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: Role.MODEL, content: fullResponse };
            return newMessages;
        });
      }
      if (fileForAnalysis) {
        hasStartedAnalysis.current = true;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      const finalErrorMessage = `Error: ${errorMessage}. Please check your API key and network connection.`;
      setError(finalErrorMessage);
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: Role.MODEL, content: `Sorry, I encountered an error. ${errorMessage}` };
          return newMessages;
      });
    } finally {
      setIsLoading(false);
      if (fileForAnalysis) {
          setIsAnalyzing(false);
      }
    }
  }, [isLoading]);
  
  const handleReset = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoFile(null);
    setMessages([]);
    setIsLoading(false);
    setIsAnalyzing(false);
    setError(null);
    hasStartedAnalysis.current = false;
    resetChat();
  }, [videoUrl]);
  
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    }
  }, [videoUrl]);


  const handleVideoReady = (file: File) => {
    handleReset();
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    const initialPrompt = "Please analyze the provided video and give me a summary of key events and any violations.";
    handleSendMessage(initialPrompt, file); 
  };
  
  const handleUrlReady = (url: string) => {
    handleReset();

    const fetchVideoAndAnalyze = async () => {
      setIsAnalyzing(true);
      setIsLoading(true); // General loading for chat window
      setError(null);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const filename = url.substring(url.lastIndexOf('/')+1) || "video_from_url.mp4";
        const file = new File([blob], filename, { type: blob.type });

        const videoObjectURL = URL.createObjectURL(file);
        setVideoUrl(videoObjectURL);
        setVideoFile(file);

        const initialPrompt = "Please analyze the provided video and give me a summary of key events and any violations.";
        await handleSendMessage(initialPrompt, file);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        let detailedError = `Error fetching video from URL: ${errorMessage}.`;
        if (errorMessage.toLowerCase().includes('failed to fetch')) {
            detailedError += ' This might be due to a network issue or CORS policy on the server. Please ensure the URL is a direct, publicly accessible link to a video file.';
        }
        setError(detailedError);
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    };
    
    fetchVideoAndAnalyze();
  };
  
  const handleFollowUpMessage = (messageText: string) => {
      handleSendMessage(messageText);
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <main className="grid md:grid-cols-2 gap-8 p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 md:h-[calc(100vh-4rem)]">
          <header>
            <h1 className="text-3xl font-bold text-white">Vision Agent</h1>
            <p className="text-gray-400 mt-1">AI-powered Video Analysis Chat</p>
          </header>
          <VideoInput 
            onVideoReady={handleVideoReady}
            onUrlReady={handleUrlReady}
            onReset={handleReset}
            videoUrl={videoUrl}
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasStartedAnalysis.current}
          />
        </div>
        <div className="md:h-[calc(100vh-4rem)]">
          <ChatWindow 
            messages={messages} 
            onSendMessage={handleFollowUpMessage}
            isLoading={isLoading}
            isReady={hasStartedAnalysis.current}
          />
          {error && <div className="mt-2 text-center text-red-400 text-sm">{error}</div>}
        </div>
      </main>
    </div>
  );
}
