// Redis utils
import { createClient, RedisClientType } from '@redis/client';
import dotenv from 'dotenv';

dotenv.config();

const HOST = process.env.REDIS_HOST || 'redis';
const PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const PASSWORD = process.env.REDIS_PASSWORD || 'redis_password';

const redisURL = process.env.REDIS_URL || `redis://${HOST}:${PORT}`;

class RedisClient {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: redisURL,
      password: PASSWORD
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.connect().catch(console.error);
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, duration?: number): Promise<void> {
    if (duration) {
      await this.client.set(key, value, { EX: duration });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}

const redisClient = new RedisClient();
export default redisClient;
