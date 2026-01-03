import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useRealtimeLoop = (loopId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!loopId) return;

    console.log('[Realtime] Subscribing to loop updates:', loopId);

    const channel = supabase
      .channel(`loop-${loopId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks',
          filter: `loop_id=eq.${loopId}`,
        },
        (payload) => {
          console.log('[Realtime] Task change detected:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      console.log('[Realtime] Unsubscribing from loop updates:', loopId);
      supabase.removeChannel(channel);
    };
  }, [loopId, onUpdate]);
};
