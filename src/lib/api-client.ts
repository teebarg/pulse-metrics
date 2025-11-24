const API_URL = import.meta.env.VITE_API_URL;

export class AnalyticsAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRealtimeMetrics() {
    return this.fetch('/analytics/realtime');
  }

  async getTodayMetrics() {
    return this.fetch('/analytics/today');
  }

  async getTopProducts(days = 7, metric = 'views') {
    return this.fetch(`/analytics/top-products?days=${days}&metric=${metric}`);
  }
}
