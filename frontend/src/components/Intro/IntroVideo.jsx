import React, { useEffect } from 'react';
export default function IntroVideo({
  videoRef,
  onTimeUpdate,
  onEnded,
  children
}) {
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented or deferred:', err);
        });
      }
    }
  }, [videoRef]);
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: 'min(100vw, calc(100vh * (16 / 9)))',
        height: 'min(100vh, calc(100vw * (9 / 16)))',
        maxWidth: '1920px',
        maxHeight: '1080px',
        aspectRatio: '16 / 9'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        className="w-full h-full object-contain pointer-events-none"
      >
        <source src="/videos/intro.mp4" type="video/mp4" />
      </video>
      {children}
    </div>
  );
}
