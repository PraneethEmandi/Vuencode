
import React, { useState, useRef } from 'react';
import { ArrowUpTrayIcon, LinkIcon, ArrowPathIcon } from './Icons';

interface VideoInputProps {
  onVideoReady: (file: File) => void;
  onUrlReady: (url: string) => void;
  onReset: () => void;
  videoUrl: string | null;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
}

export const VideoInput: React.FC<VideoInputProps> = ({ 
  onVideoReady, 
  onUrlReady,
  onReset,
  videoUrl, 
  isAnalyzing,
  hasAnalyzed
}) => {
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoReady(file);
    } else {
      alert("Please select a valid video file.");
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (url.trim()) {
        onUrlReady(url.trim());
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (videoUrl) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4 shadow-lg h-full justify-between">
        <div className="w-full bg-black rounded-lg overflow-hidden aspect-video">
            <video src={videoUrl} controls className="w-full h-full object-contain"></video>
        </div>
        
        {isAnalyzing && (
             <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-md text-center">
                <div role="status" className="animate-spin rounded-full h-5 w-5 border-b-2 border-white">
                    <span className="sr-only">Analyzing...</span>
                </div>
                Analyzing video...
             </div>
        )}

        {hasAnalyzed && !isAnalyzing && (
             <button 
                onClick={onReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                <ArrowPathIcon />
                Analyze Another Video
            </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col gap-4 shadow-lg h-full">
      <div className="flex border-b border-gray-700">
        <button 
          onClick={() => setInputType('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${inputType === 'upload' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          <ArrowUpTrayIcon /> Upload Video
        </button>
        <button 
          onClick={() => setInputType('url')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${inputType === 'url' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          <LinkIcon /> From URL
        </button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        {inputType === 'upload' ? (
          <>
            <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white">Select a video file</h3>
            <p className="text-gray-400">up to 2 minutes long</p>
            <button onClick={triggerFileSelect} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Browse Files
            </button>
          </>
        ) : (
          <form onSubmit={handleUrlSubmit} className="w-full">
            <LinkIcon className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white">Enter video URL</h3>
            <p className="text-gray-400 mb-4">Must be a direct link to a video file</p>
            <div className="flex gap-2">
              <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-grow bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Load</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
