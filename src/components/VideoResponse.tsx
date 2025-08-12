import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  RotateCcw,
  Clock,
  MessageSquare,
  Headphones
} from 'lucide-react';

interface VideoResponseProps {
  result: {
    question: string;
    response: string;
    audio_url?: string;
    video_url?: string;
    phoneme_analysis?: any;
    tokens_used?: number;
    word_count?: number;
    file_info?: {
      name: string;
      type: string;
      size: number;
    };
  };
  onNewQuestion?: () => void;
}

export function VideoResponse({ result, onNewQuestion }: VideoResponseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleDurationChange = () => setDuration(video.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('durationchange', handleDurationChange);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('durationchange', handleDurationChange);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (result.video_url && video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    } else if (result.audio_url && audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    } else if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resposta do Capitão Caverna',
          text: `Pergunta: "${result.question}"\n\nResposta: "${result.response}"`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const text = `Pergunta: "${result.question}"\n\nResposta: "${result.response}"\n\n#ModoCaverna #CapitaoCaverna`;
    navigator.clipboard.writeText(text).then(() => {
      // Você pode adicionar um toast aqui
      alert('Resposta copiada para a área de transferência!');
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Player Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🐺</span>
            <span>Resposta do Capitão Caverna</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Video Player */}
          {result.video_url ? (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={result.video_url}
                className="w-full h-auto max-h-96 object-contain"
                poster="/upload/reference1-capitao-caverna-front.webp"
                controls={false}
                muted={isMuted}
              />
              
              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <div className="flex-1 flex items-center space-x-2 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-white/30 rounded-full h-1">
                      <div 
                        className="bg-red-500 h-1 rounded-full transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : result.audio_url ? (
            /* Audio Player */
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Áudio do Capitão Caverna</h3>
                  <p className="text-gray-300 text-sm">Resposta em áudio</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
              </div>
              
              <audio
                ref={audioRef}
                src={result.audio_url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              />
            </div>
          ) : (
            /* Fallback - Texto apenas */
            <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🐺</div>
              <h3 className="text-white text-xl font-bold mb-2">Capitão Caverna Responde</h3>
              <p className="text-red-100">Resposta em texto disponível abaixo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcrição e Resposta */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Conversa</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? 'Ocultar' : 'Mostrar'} Detalhes
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pergunta */}
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">Sua Pergunta</Badge>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">{result.question}</p>
            </div>
          </div>

          <Separator />

          {/* Resposta */}
          <div className="space-y-2">
            <Badge variant="default" className="text-xs bg-red-600">Resposta do Capitão</Badge>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-medium">{result.response}</p>
            </div>
          </div>

          {/* Detalhes Técnicos */}
          {showTranscript && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm text-gray-700">Detalhes Técnicos</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {result.word_count && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900">{result.word_count}</div>
                    <div className="text-gray-500">Palavras</div>
                  </div>
                )}
                
                {result.tokens_used && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900">{result.tokens_used}</div>
                    <div className="text-gray-500">Tokens</div>
                  </div>
                )}
                
                {result.phoneme_analysis?.estimated_duration_seconds && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900">
                      {result.phoneme_analysis.estimated_duration_seconds}s
                    </div>
                    <div className="text-gray-500">Duração</div>
                  </div>
                )}
                
                {result.file_info?.size && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900">
                      {formatFileSize(result.file_info.size)}
                    </div>
                    <div className="text-gray-500">Arquivo</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onNewQuestion} className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Fazer Nova Pergunta</span>
            </Button>
            
            <Button variant="outline" onClick={handleShare} className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Compartilhar Resposta</span>
            </Button>
            
            {result.video_url && (
              <Button 
                variant="outline" 
                onClick={() => handleDownload(result.video_url!, 'capitao-caverna-resposta.mp4')}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Vídeo</span>
              </Button>
            )}
            
            {result.audio_url && (
              <Button 
                variant="outline" 
                onClick={() => handleDownload(result.audio_url!, 'capitao-caverna-audio.mp3')}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Áudio</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VideoResponse;

