'use client';

import { usePwaUpdate } from '@/hooks/use-pwa-update';

export function PwaUpdateBanner() {
  const { updateAvailable, updateApp } = usePwaUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg border-t-2 border-green-500">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1">
            <svg
              className="h-6 w-6 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">New version available!</p>
              <p className="text-xs sm:text-sm text-green-100">
                Update now for the latest features and improvements
              </p>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="px-4 py-2 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 active:bg-green-100 transition-colors shadow-md flex-shrink-0"
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
