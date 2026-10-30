"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 单向锁：IO 自动播放或点击后备任一触发后不再改变
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const posterUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // 进入视口自动播放：静音 + 循环（loop 需 playlist 指向同一视频）
  const autoPlayUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
  // 点击播放后备：静音自动开播，不循环
  const clickPlayUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`;

  // IntersectionObserver：视频区域进入视口即自动播放
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEmbedUrl((prev) => prev ?? autoPlayUrl);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlayUrl]);

  const playOnClick = () => setEmbedUrl((prev) => prev ?? clickPlayUrl);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        data-video-activated={embedUrl ? "true" : "idle"}
        data-video-id={videoId}
        className="relative w-full overflow-hidden rounded-lg border border-[hsl(var(--nav-theme)/0.2)] bg-[hsl(var(--nav-theme)/0.08)]"
        style={{ paddingBottom: "56.25%" }}
      >
        {embedUrl ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            {/* 官方视频缩略图作预览封面（由 videoId 派生，无旧封面残留） */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={title}
              className="absolute top-0 left-0 w-full h-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={playOnClick}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center
                         rounded-full bg-[hsl(var(--nav-theme))] text-white shadow-lg
                         transition-transform hover:scale-110"
            >
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
