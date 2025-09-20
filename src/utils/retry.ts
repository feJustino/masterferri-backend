import { IRetryService } from '@/interfaces';
import { Logger } from './logger';

export class RetryService implements IRetryService {
  private logger = new Logger();

  async execute<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoff?: 'linear' | 'exponential';
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 'exponential'
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        if (attempt > 0) {
          this.logger.info(`Operation succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.logger.error(`Operation failed after ${maxRetries + 1} attempts`, lastError);
          throw lastError;
        }

        const waitTime = backoff === 'exponential' 
          ? delay * Math.pow(2, attempt)
          : delay * (attempt + 1);

        this.logger.warn(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        });

        await this.sleep(waitTime);
      }
    }

    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
