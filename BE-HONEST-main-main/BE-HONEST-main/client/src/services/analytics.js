class Analytics {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
  }

  init(userId) {
    this.userId = userId;
    this.isInitialized = true;
    this.setupPerformanceTracking();
  }

  setupPerformanceTracking() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformance(entry);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }

  trackPerformance(entry) {
    if (!this.isInitialized) return;

    const data = {
      userId: this.userId,
      metric: entry.name,
      value: entry.value,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.sendToAnalytics('performance', data);
  }

  trackUserAction(action, data = {}) {
    if (!this.isInitialized) return;

    const eventData = {
      userId: this.userId,
      action,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...data
    };

    this.sendToAnalytics('user_action', eventData);
  }

  trackError(error, context = {}) {
    if (!this.isInitialized) return;

    const errorData = {
      userId: this.userId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...context
    };

    this.sendToAnalytics('error', errorData);
  }

  sendToAnalytics(type, data) {
    // In production, this would send data to your analytics service
    // For development, we'll just log it
    console.log(`[Analytics] ${type}:`, data);
    
    // Example: Send to your backend
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    }).catch(error => console.error('Analytics error:', error));
  }
}

export const analytics = new Analytics(); 