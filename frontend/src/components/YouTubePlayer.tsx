'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X, ExternalLink } from 'lucide-react';
import { VideoMaterial } from '@/data/mockStore';

interface YouTubePlayerProps {
  video: VideoMaterial;
  onClose?: () => void;
}

export default function YouTubePlayer({ video, onClose }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Извлекаем ID видео из URL YouTube
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getYouTubeId(video.url);

  if (!videoId) {
    return (
      <div className="my-4 p-4 bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-semibold text-gray-200 mb-1">{video.title}</h5>
            {video.description && (
              <p className="text-xs text-gray-400">{video.description}</p>
            )}
          </div>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 rounded-lg text-xs text-sky-300 transition-colors flex items-center gap-2"
          >
            <ExternalLink size={14} />
            Открыть на YouTube
          </a>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl overflow-hidden"
    >
      {!isPlaying ? (
        <div className="relative aspect-video bg-black">
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={32} className="text-white ml-1" />
                </div>
              </div>
              <h5 className="text-lg font-bold text-white mb-2 px-4">{video.title}</h5>
              {video.channel && (
                <p className="text-sm text-gray-300">{video.channel}</p>
              )}
              {video.duration && (
                <p className="text-xs text-gray-400 mt-2">{video.duration}</p>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
      <div className="p-4">
        <h5 className="text-sm font-semibold text-gray-200 mb-1">{video.title}</h5>
        {video.description && (
          <p className="text-xs text-gray-400 mb-2">{video.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {video.channel && (
            <span>Канал: {video.channel}</span>
          )}
          {video.duration && (
            <span>Длительность: {video.duration}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

