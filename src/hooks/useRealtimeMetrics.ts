import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeMetrics {
  active_visitors: number;
  recent_purchases: number;
  recent_revenue: number;
  timestamp: string;
}

export function useRealtimeMetrics(organizationId: string) {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        // Get active visitors (unique sessions)
        const { data: visitors, error: visitorsError } = await supabase
          .from('events')
          .select('session_id')
          .eq('organization_id', organizationId)
          .gte('timestamp', fiveMinutesAgo);

        if (visitorsError) throw visitorsError;

        const activeVisitors = new Set(visitors?.map(e => e.session_id)).size;

        // Get recent purchases
        const { data: purchases, error: purchasesError } = await supabase
          .from('events')
          .select('properties')
          .eq('organization_id', organizationId)
          .eq('event_type', 'purchase')
          .gte('timestamp', fiveMinutesAgo);

        if (purchasesError) throw purchasesError;

        const recentRevenue = purchases?.reduce(
          (sum, p) => sum + (p.properties?.revenue || 0),
          0
        ) || 0;

        setMetrics({
          active_visitors: activeVisitors,
          recent_purchases: purchases?.length || 0,
          recent_revenue: recentRevenue,
          timestamp: new Date().toISOString(),
        });

        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, [organizationId]);

  return { metrics, isLoading, error };
}
