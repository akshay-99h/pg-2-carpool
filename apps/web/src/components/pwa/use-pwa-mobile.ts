'use client';

import { useEffect, useState } from 'react';

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function readIsPwaMobile() {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = Boolean((window.navigator as NavigatorWithStandalone).standalone);
  const isAndroidTwa = document.referrer.startsWith('android-app://');
  const isStandalone = isStandaloneDisplay || isIosStandalone || isAndroidTwa;
  const isMobileViewport = window.matchMedia('(max-width: 900px)').matches;

  return isStandalone && isMobileViewport;
}

export function useIsPwaMobile() {
  const [isPwaMobile, setIsPwaMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsPwaMobile(readIsPwaMobile());
    update();

    const displayMedia = window.matchMedia('(display-mode: standalone)');
    const viewportMedia = window.matchMedia('(max-width: 900px)');

    displayMedia.addEventListener('change', update);
    viewportMedia.addEventListener('change', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      displayMedia.removeEventListener('change', update);
      viewportMedia.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return isPwaMobile;
}
