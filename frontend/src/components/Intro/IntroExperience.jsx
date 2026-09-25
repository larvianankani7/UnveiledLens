import React, { useEffect } from 'react';
import { useIntroTiming } from '../../hooks/useIntroTiming.js';
import IntroVideo from './IntroVideo.jsx';
import StartButton from './StartButton.jsx';

/**
 * Orchestrator component for the UnveiledLens intro experience.
 *
 * Sits as an isolated, fixed layer on top of the website.
 * Prevents page scrollbars during intro playback.
 * At 9.5s: Shows the animated peacock-green START button.
 * At 10.0s: Freezes video on its final frame indefinitely.
 * When START is clicked: Fades out gently, unmounts, and restores full normal page interaction.
 */
export default function IntroExperience({ onFinish }) {
  const {
    videoRef,
    showStart,
    isExiting,
    isDismissed,
    evaluateTime,
    handleStart
  } = useIntroTiming({ onComplete: onFinish });

  // Suppress browser scrollbars while the intro is active
  useEffect(() => {
    if (!isDismissed) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isDismissed]);

  // Unmount completely once transition finishes
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
        {/* START Button centered horizontally and vertically */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <StartButton show={showStart} onClick={handleStart} />
        </div>
      </IntroVideo>
    </aside>
  );
}
