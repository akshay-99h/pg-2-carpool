'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const UPDATE_POLL_MS = 60_000;

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only a *replacement* of an existing controller means "a new version took
    // over". On a first-ever install the controller goes from null to active,
    // and reloading there would bounce the user for no reason.
    const hadControllerAtLoad = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    const onControllerChange = () => {
      if (reloading || !hadControllerAtLoad) {
        return;
      }
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const trackWaiting = (registration: ServiceWorkerRegistration) => {
      registrationRef.current = registration;

      // A worker may already be waiting from a previous visit.
      if (registration.waiting && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    };

    void navigator.serviceWorker.ready.then(trackWaiting);

    const intervalId = window.setInterval(() => {
      void registrationRef.current?.update().catch(() => {
        /* offline or update check failed; retried on the next tick */
      });
    }, UPDATE_POLL_MS);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.clearInterval(intervalId);
    };
  }, []);

  const updateApp = useCallback(() => {
    const waiting = registrationRef.current?.waiting;
    if (!waiting) {
      // Nothing is waiting anymore (another tab may have activated it).
      window.location.reload();
      return;
    }

    setUpdating(true);
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  const dismissUpdate = useCallback(() => setUpdateAvailable(false), []);

  return {
    updateAvailable,
    updating,
    updateApp,
    dismissUpdate,
  };
}
