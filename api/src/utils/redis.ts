// Redis utils
import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  client: any;

  constructor() {
    this.connectToRedis();
  }

  private connectToRedis() {
    try {
      this.client = createClient();

      this.client.on('error', (err: Error) => {
        console.log(`Redis client not connected to the server: ${err.message}`);
        this.client = null; // Set client to null on error
      });

      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });
    } catch (error: any) {
      console.error('Redis connection error:', error.message);
      this.client = null; // Set client to null on error
    }
  }

  private async pingRedis(): Promise<boolean> {
    if (!this.client || !this.client.ready) {
      console.log('Redis not running');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      this.client!.ping((error: Error | null, response: string) => {
        if (error || response !== 'PONG') {
          console.error('Redis ping error:', error || 'Unexpected response');
          console.log('Redis not running');
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async isAlive(): Promise<boolean> {
    try {
      return await this.pingRedis();
    } catch (error: any) {
      console.error('Error checking Redis status:', error.message);
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAlive()) {
      // Handle the case when there's no Redis connection
      console.error('Redis is not alive');
      return null; // You can choose an appropriate value or return an error here
    }

    const asyncGet = promisify(this.client!.get).bind(this.client);
    try {
      const value = await asyncGet(key);
      return value;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, duration: number): Promise<void> {
    if (!this.isAlive()) {
      // Handle the case when there's no Redis connection
      console.error('Redis is not alive');
      return; // You can choose to return an error or handle it as needed
    }

    try {
      await this.client!.setex(key, duration, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAlive()) {
      // Handle the case when there's no Redis connection
      console.error('Redis is not alive');
      return; // You can choose to return an error or handle it as needed
    }

    try {
      await this.client!.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
