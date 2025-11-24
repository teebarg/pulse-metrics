import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  product_id: string;
  product_name: string;
  count: number;
  revenue: number;
}

export function useTopProducts(organizationId: string, days = 7, metric: 'views' | 'purchases' = 'views') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const eventType = metric === 'views' ? 'product_view' : 'purchase';

        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('properties')
          .eq('organization_id', organizationId)
          .eq('event_type', eventType)
          .gte('timestamp', startDate);

        if (eventsError) throw eventsError;

        // Aggregate by product
        const productMap = new Map<string, { name: string, count: number, revenue: number }>();

        events?.forEach(event => {
          const productId = event.properties?.product_id;
          const productName = event.properties?.product_name || 'Unknown Product';

          if (productId) {
            if (!productMap.has(productId)) {
              productMap.set(productId, { name: productName, count: 0, revenue: 0 });
            }
            const product = productMap.get(productId)!;
            product.count++;
            product.revenue += event.properties?.revenue || 0;
          }
        });

        // Convert to array and sort
        const topProducts = Array.from(productMap.entries())
          .map(([id, data]) => ({
            product_id: id,
            product_name: data.name,
            count: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setProducts(topProducts);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Refresh every 5 minutes
    const interval = setInterval(fetchProducts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [organizationId, days, metric]);

  return { products, isLoading, error };
}
