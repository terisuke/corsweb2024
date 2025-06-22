/**
 * Rate Limiter for Google Gemini API
 * Implements exponential backoff and retry logic
 */
export class RateLimiter {
  constructor(options = {}) {
    this.requestsPerMinute = options.requestsPerMinute || 60;
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.requestHistory = [];
  }

  /**
   * Wait for rate limit compliance
   */
  async waitForRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requestHistory = this.requestHistory.filter(time => time > oneMinuteAgo);
    
    // If we've made too many requests in the last minute, wait
    if (this.requestHistory.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requestHistory);
      const waitTime = oldestRequest + 60000 - now;
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await this.sleep(waitTime);
      }
    }
    
    // Record this request
    this.requestHistory.push(now);
  }

  /**
   * Execute a function with exponential backoff retry
   */
  async executeWithRetry(fn, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.waitForRateLimit();
        const result = await fn();
        
        if (attempt > 1) {
          console.log(`✅ ${context} succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Check if it's a rate limit error
        const isRateLimit = this.isRateLimitError(error);
        const delay = this.calculateDelay(attempt, isRateLimit);
        
        console.log(`⚠️  ${context} failed on attempt ${attempt}/${this.maxRetries}`);
        console.log(`   Error: ${error.message}`);
        console.log(`   Retrying in ${Math.ceil(delay / 1000)} seconds...`);
        
        await this.sleep(delay);
      }
    }
    
    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Calculate delay with exponential backoff
   */
  calculateDelay(attempt, isRateLimit = false) {
    if (isRateLimit) {
      // For rate limit errors, use longer delays
      return Math.min(this.baseDelay * Math.pow(3, attempt), this.maxDelay);
    }
    
    // For other errors, use standard exponential backoff
    const jitter = Math.random() * 0.1 * this.baseDelay; // 10% jitter
    return Math.min(this.baseDelay * Math.pow(2, attempt - 1) + jitter, this.maxDelay);
  }

  /**
   * Check if error is related to rate limiting
   */
  isRateLimitError(error) {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') ||
           message.includes('quota') ||
           message.includes('too many requests') ||
           message.includes('429');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestHistory.filter(time => time > oneMinuteAgo);
    
    return {
      requestsInLastMinute: recentRequests.length,
      remainingRequests: Math.max(0, this.requestsPerMinute - recentRequests.length),
      requestsPerMinute: this.requestsPerMinute
    };
  }
}

export default RateLimiter;