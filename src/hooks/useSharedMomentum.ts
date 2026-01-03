import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useSharedMomentum
 * 
 * Subscribes to real-time changes on the tasks table for a specific loop.
 * Triggers a recalculation callback whenever tasks are updated (completed/added/deleted).
 * This ensures the progress ring ("Momentum") stays in sync across all team members.
 */
export const useSharedMomentum = (loopId: string, onUpdate: () => void) => {
  // Use ref to avoid re-subscribing if the callback changes identity
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!loopId) return;

    console.log('[Shared Momentum] Activating for loop:', loopId);

    const channel = supabase
      .channel(`momentum-${loopId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to ALL events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tasks',
          filter: `loop_id=eq.${loopId}`,
        },
        (payload) => {
          console.log('[Shared Momentum] Detected change:', payload.eventType);
          // Trigger the update callback (which should fetch latest data and update progress)
          // We add a small delay to ensure DB writes have propagated if needed, 
          // though usually realtime events happen AFTER write.
          onUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      console.log('[Shared Momentum] Deactivating for loop:', loopId);
      supabase.removeChannel(channel);
    };
  }, [loopId]);
};
