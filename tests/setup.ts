import { MongoMemoryServer } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';
import mongoClient from '../api/v1/src/utils/mongo';
import redisClient from '../api/v1/src/utils/redis';

let mongoServer: MongoMemoryServer;
let redisServer: RedisMemoryServer;

beforeAll(async () => {
  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoClient.connect(mongoUri);

  // Setup Redis Memory Server
  redisServer = new RedisMemoryServer();
  const redisUri = await redisServer.getConnectionString();
  await redisClient.connect(redisUri);
});

afterAll(async () => {
  await mongoClient.close();
  await redisClient.quit();
  await mongoServer.stop();
  await redisServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = await mongoClient.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  // Clear Redis
  await redisClient.flushAll();
});
