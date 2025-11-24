/**
 * Keep-Alive Service
 * Prevents Render backend from going to sleep by sending periodic requests
 */

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private readonly PING_INTERVAL = 60000; // 1 minute in milliseconds
  private readonly API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  private readonly HEALTH_ENDPOINT = `${this.API_URL}/health`;

  /**
   * Start the keep-alive service
   */
  start(): void {
    if (this.isActive) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log('Starting keep-alive service...');
    this.isActive = true;

    // Send initial ping immediately
    this.ping();

    // Set up recurring pings every minute
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);

    console.log(`Keep-alive service started. Pinging every ${this.PING_INTERVAL / 1000} seconds.`);
  }

  /**
   * Stop the keep-alive service
   */
  stop(): void {
    if (!this.isActive) {
      console.log('Keep-alive service is not running');
      return;
    }

    console.log('Stopping keep-alive service...');
    this.isActive = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Keep-alive service stopped');
  }

  /**
   * Check if the service is currently active
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Send a ping request to the backend health endpoint
   */
  private async ping(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(this.HEALTH_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`Keep-alive ping successful: ${data.status} at ${new Date().toLocaleTimeString()}`);
      } else {
        console.warn(`Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Keep-alive ping timed out');
      } else {
        console.warn('Keep-alive ping failed:', error);
      }
    }
  }

  /**
   * Get service status information
   */
  getStatus(): {
    isRunning: boolean;
    pingInterval: number;
    healthEndpoint: string;
  } {
    return {
      isRunning: this.isActive,
      pingInterval: this.PING_INTERVAL,
      healthEndpoint: this.HEALTH_ENDPOINT,
    };
  }
}

// Create and export a singleton instance
export const keepAliveService = new KeepAliveService();

// Auto-start the service when the module is loaded
// This ensures the backend stays awake as long as the frontend is active
if (typeof window !== 'undefined') {
  // Only start in browser environment
  keepAliveService.start();

  // Stop the service when the page is about to unload
  window.addEventListener('beforeunload', () => {
    keepAliveService.stop();
  });

  // Handle page visibility changes to pause/resume when tab is not active
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, but don't stop the service to keep backend awake
      console.log('Page hidden, but keeping keep-alive service running');
    } else {
      // Page is visible, ensure service is running
      if (!keepAliveService.isRunning()) {
        keepAliveService.start();
      }
    }
  });
}

export default keepAliveService;
