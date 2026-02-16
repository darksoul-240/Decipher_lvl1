import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gauntlet_mission';
const MISSION_DURATION = 30 * 60 * 1000; // 30 minutes in ms

/**
 * Persistent 30-minute mission timer backed by localStorage.
 *
 * Returns:
 *   remaining   – ms remaining (0 when expired)
 *   minutes     – formatted minutes string
 *   seconds     – formatted seconds string
 *   expired     – boolean, true when timer hits 0
 *   isRunning   – boolean, true when a mission is active
 *   progress    – 0..1 how much time has elapsed
 *   startMission(challengeId) – begin the timer
 *   clearMission()            – remove the timer
 */
export default function useMissionTimer() {
  const [state, setState] = useState(() => readStorage());

  // Tick every second while running
  useEffect(() => {
    if (!state.isRunning || state.expired) return;

    const tick = () => setState(readStorage());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.isRunning, state.expired]);

  const startMission = useCallback((challengeId) => {
    const data = {
      challengeId,
      startTime: Date.now(),
      duration: MISSION_DURATION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setState(readStorage());
  }, []);

  const clearMission = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      remaining: 0,
      minutes: '00',
      seconds: '00',
      expired: false,
      isRunning: false,
      progress: 0,
      challengeId: null,
    });
  }, []);

  return { ...state, startMission, clearMission };
}

// ─── Helpers ───

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const { challengeId, startTime, duration } = JSON.parse(raw);
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, duration - elapsed);
    const expired = remaining <= 0;
    const totalSec = Math.ceil(remaining / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;

    return {
      remaining,
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
      expired,
      isRunning: true,
      progress: Math.min(1, elapsed / duration),
      challengeId,
    };
  } catch {
    return emptyState();
  }
}

function emptyState() {
  return {
    remaining: 0,
    minutes: '30',
    seconds: '00',
    expired: false,
    isRunning: false,
    progress: 0,
    challengeId: null,
  };
}
