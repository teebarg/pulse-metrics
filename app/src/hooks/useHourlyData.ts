import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface HourlyDataPoint {
  time: string;
  visitors: number;
  sales: number;
  revenue: number;
}

export function useHourlyData(organizationId: string, hours = 24) {
  const [data, setData] = useState<HourlyDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

        // Fetch all events from last N hours
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('event_type, timestamp, session_id, properties')
          .eq('organization_id', organizationId)
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: true });

        if (eventsError) throw eventsError;

        // Group by hour
        const hourlyMap = new Map<string, { visitors: Set<string>, sales: number, revenue: number }>();

        events?.forEach(event => {
          const hour = new Date(event.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit',
            hour12: true 
          });

          if (!hourlyMap.has(hour)) {
            hourlyMap.set(hour, { visitors: new Set(), sales: 0, revenue: 0 });
          }

          const hourData = hourlyMap.get(hour)!;
          if (event.session_id) {
            hourData.visitors.add(event.session_id);
          }

          if (event.event_type === 'purchase') {
            hourData.sales++;
            hourData.revenue += event.properties?.revenue || 0;
          }
        });

        // Convert to array format
        const hourlyData: HourlyDataPoint[] = [];
        for (let i = hours - 1; i >= 0; i--) {
          const hour = new Date(Date.now() - i * 60 * 60 * 1000)
            .toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
          
          const data = hourlyMap.get(hour) || { visitors: new Set(), sales: 0, revenue: 0 };
          
          hourlyData.push({
            time: hour,
            visitors: data.visitors.size,
            sales: data.sales,
            revenue: data.revenue,
          });
        }

        setData(hourlyData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [organizationId, hours]);

  return { data, isLoading, error };
}
