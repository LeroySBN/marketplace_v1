// Redis utils
import { createClient } from 'redis';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const HOST = process.env.REDIS_HOST || 'redis';
const PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

const redisURL = process.env.REDIS_URL || `redis://default@${HOST}:${PORT}`;

class RedisClient {
  client: any | undefined;

  constructor() {
    this.client = createClient({
        url: redisURL,
    });
    this.client.on('error', (err: Error) => {
      console.log(`Redis client not connected to the server: ${err.message}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key: string) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    try {
      const value = await asyncGet(key);
      return value;
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: string, duration: number) {
    try {
      await this.client.setex(key, duration, value);
    } catch (error) {
      console.log(error);
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.log(error);
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
