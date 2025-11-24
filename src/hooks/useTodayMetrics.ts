import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TodayMetrics {
  total_events: number;
  unique_visitors: number;
  total_purchases: number;
  total_revenue: number;
  conversion_rate: string;
}

export function useTodayMetrics(organizationId: string) {
  const [metrics, setMetrics] = useState<TodayMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Total events
        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('timestamp', todayStart.toISOString());

        // Purchases
        const { data: purchases, error: purchasesError } = await supabase
          .from('events')
          .select('properties')
          .eq('organization_id', organizationId)
          .eq('event_type', 'purchase')
          .gte('timestamp', todayStart.toISOString());

        if (purchasesError) throw purchasesError;

        const totalPurchases = purchases?.length || 0;
        const totalRevenue = purchases?.reduce(
          (sum, p) => sum + (p.properties?.revenue || 0),
          0
        ) || 0;

        // Unique visitors
        const { data: sessions } = await supabase
          .from('events')
          .select('session_id')
          .eq('organization_id', organizationId)
          .gte('timestamp', todayStart.toISOString());

        const uniqueVisitors = new Set(sessions?.map(s => s.session_id)).size;

        const conversionRate = uniqueVisitors > 0
          ? ((totalPurchases / uniqueVisitors) * 100).toFixed(2)
          : '0.00';

        setMetrics({
          total_events: totalEvents || 0,
          unique_visitors: uniqueVisitors,
          total_purchases: totalPurchases,
          total_revenue: totalRevenue,
          conversion_rate: conversionRate,
        });

        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Refresh every minute
    const interval = setInterval(fetchMetrics, 60000);

    return () => clearInterval(interval);
  }, [organizationId]);

  return { metrics, isLoading, error };
}
