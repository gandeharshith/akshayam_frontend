/**
 * Keep-Alive Service
 * Prevents backend from going to sleep by sending periodic requests every 5 minutes
 * Runs continuously even when the browser tab is not active
 */

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private retryCount: number = 0;
  private readonly PING_INTERVAL = 300000; // 5 minutes in milliseconds (300000ms = 5 min)
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 30000; // 30 seconds
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

    // Set up recurring pings every 5 minutes
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);

    console.log(`Keep-alive service started. Pinging every ${this.PING_INTERVAL / 60000} minutes (${this.PING_INTERVAL / 1000} seconds).`);
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
   * Send a ping request to the backend health endpoint with retry logic
   */
  private async ping(): Promise<void> {
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(this.HEALTH_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({ status: 'ok' }));
        console.log(`✅ Keep-alive ping successful: ${data.status || 'healthy'} at ${timestamp}`);
        this.retryCount = 0; // Reset retry count on success
      } else {
        console.warn(`⚠️ Keep-alive ping failed with status: ${response.status} at ${timestamp}`);
        await this.handlePingFailure();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⏱️ Keep-alive ping timed out at ${timestamp}`);
      } else {
        console.warn(`❌ Keep-alive ping failed at ${timestamp}:`, error);
      }
      await this.handlePingFailure();
    }
  }

  /**
   * Handle ping failures with retry logic
   */
  private async handlePingFailure(): Promise<void> {
    this.retryCount++;
    
    if (this.retryCount <= this.MAX_RETRIES) {
      console.log(`🔄 Retrying keep-alive ping in ${this.RETRY_DELAY / 1000} seconds (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
      
      // Wait for retry delay, then retry
      setTimeout(() => {
        if (this.isActive) {
          this.ping();
        }
      }, this.RETRY_DELAY);
    } else {
      console.error(`💀 Keep-alive ping failed after ${this.MAX_RETRIES} retries. Will continue with regular interval.`);
      this.retryCount = 0; // Reset for next regular ping
    }
  }

  /**
   * Force a manual ping (useful for testing)
   */
  public forcePing(): void {
    console.log('🚀 Forcing manual keep-alive ping...');
    this.ping();
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
