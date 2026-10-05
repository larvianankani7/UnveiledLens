import React, { useEffect } from 'react';
import { useIntroTiming } from '../../hooks/useIntroTiming.js';
import IntroVideo from './IntroVideo.jsx';
import StartButton from './StartButton.jsx';
export default function IntroExperience({ onFinish }) {
  const {
    videoRef,
    showStart,
    isExiting,
    isDismissed,
    evaluateTime,
    handleStart
  } = useIntroTiming({ onComplete: onFinish });
  useEffect(() => {
    if (!isDismissed) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isDismissed]);
  if (isDismissed) {
    return null;
  }
  return (
    <aside
      className={`fixed inset-0 z-50 bg-[#000000] flex items-center justify-center overflow-hidden select-none transition-opacity duration-700 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="UnveiledLens Intro"
      style={{ willChange: 'opacity' }}
    >
      <IntroVideo
        videoRef={videoRef}
        onTimeUpdate={evaluateTime}
        onEnded={evaluateTime}
      >
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <StartButton show={showStart} onClick={handleStart} />
        </div>
      </IntroVideo>
    </aside>
  );
}
