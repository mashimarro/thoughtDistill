'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('语音识别错误:', event.error);
          
          let errorMessage = '';
          switch (event.error) {
            case 'not-allowed':
              errorMessage = '请允许浏览器使用麦克风权限';
              break;
            case 'no-speech':
              errorMessage = '未检测到语音，请重试';
              break;
            case 'network':
              errorMessage = '网络错误，请检查网络连接';
              break;
            default:
              errorMessage = '语音识别失败，请重试';
          }
          
          setError(errorMessage);
          setIsListening(false);
          
          // 3秒后清除错误信息
          setTimeout(() => setError(''), 3000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 忽略停止错误
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setError('');
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.error('切换语音识别状态失败:', err);
      setError('启动语音识别失败');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-3 rounded-full transition-colors ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={isListening ? '停止录音' : '开始语音输入'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      
      {error && (
        <div className="absolute bottom-full right-0 mb-2 bg-red-500 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
