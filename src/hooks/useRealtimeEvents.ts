import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Event {
  id: string;
  event_type: string;
  timestamp: string;
  properties: any;
}

export function useRealtimeEvents(organizationId: string, limit = 10) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        setIsLoading(true);

        // Fetch initial events
        const { data: initialEvents, error: fetchError } = await supabase
          .from('events')
          .select('id, event_type, timestamp, properties')
          .eq('organization_id', organizationId)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        setEvents(initialEvents || []);

        // Subscribe to new events
        channel = supabase
          .channel(`events:${organizationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'events',
              filter: `organization_id=eq.${organizationId}`,
            },
            (payload) => {
              const newEvent = payload.new as Event;
              setEvents(prev => [newEvent, ...prev.slice(0, limit - 1)]);
            }
          )
          .subscribe();

        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [organizationId, limit]);

  return { events, isLoading, error };
}
