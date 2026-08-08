'use client';

import { track } from '@vercel/analytics';

/**
 * Product event tracking on top of the page views `<Analytics />` already
 * collects.
 *
 * PRIVACY: never pass resident-identifying data. No email, name, mobile number,
 * tower/flat, vehicle number, or free-text notes. Properties are limited to
 * enums, booleans and counts so the event stream stays non-identifying.
 */
export type AnalyticsEvent =
  // Auth funnel
  | { name: 'login_otp_requested'; props?: Record<string, never> }
  | { name: 'login_otp_verified'; props?: Record<string, never> }
  | { name: 'login_google_completed'; props?: Record<string, never> }
  | { name: 'login_failed'; props: { stage: 'otp_request' | 'otp_verify' | 'google' } }
  // Core carpool actions
  | { name: 'trip_posted'; props: { tripType: 'DAILY' | 'ONE_TIME'; seats: number } }
  | { name: 'trip_deleted'; props?: Record<string, never> }
  | { name: 'seat_requested'; props?: Record<string, never> }
  | { name: 'booking_revoked'; props: { by: 'passenger' | 'driver' } }
  | { name: 'trip_search'; props: { hasQuery: boolean; filterCount: number } }
  // PWA lifecycle
  | { name: 'pwa_intro_dismissed'; props: { via: 'skip' | 'continue' } }
  | { name: 'pwa_update_accepted'; props?: Record<string, never> }
  | { name: 'connection_lost'; props?: Record<string, never> };

/**
 * Fire-and-forget. Analytics must never break a user flow, so every failure
 * (blocked by an ad blocker, offline, script not loaded) is swallowed.
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    const props = (event as { props?: Record<string, string | number | boolean> }).props;
    if (props && Object.keys(props).length > 0) {
      track(event.name, props);
      return;
    }
    track(event.name);
  } catch {
    /* analytics is best-effort */
  }
}
