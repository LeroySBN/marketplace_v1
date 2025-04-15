// MongoDB utils
import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';

config();

class DBClient {
  private client: MongoClient;
  private _db: Db | null = null;
  private static instance: DBClient;

  private constructor() {
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || '27017';
    const database = process.env.MONGODB_DATABASE || 'marketplace_dev_db';
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;

    let url: string;
    if (username && password) {
      url = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
    } else {
      url = `mongodb://${host}:${port}/${database}`;
    }

    this.client = new MongoClient(url, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
  }

  static getInstance(): DBClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this._db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (err) {
      return false;
    }
  }

  get db(): Db {
    if (!this._db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this._db;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this._db = null;
    }
  }

  async nbUsers() {
    if (!(await this.isConnected())) {
      return -1;
    }
    const usersCollection = this.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    return userCount;
  }

  async nbVendors() {
    if (!(await this.isConnected())) {
      return -1;
    }
    const vendorsCollection = this.db.collection('vendors');
    const vendorCount = await vendorsCollection.countDocuments();
    return vendorCount;
  }

  async nbProducts() {
    if (!(await this.isConnected())) {
      return -1;
    }
    const productsCollection = this.db.collection('products');
    const productCount = await productsCollection.countDocuments();
    return productCount;
  }

  async nbOrders() {
    if (!(await this.isConnected())) {
      return -1;
    }
    const ordersCollection = this.db.collection('orders');
    const orderCount = await ordersCollection.countDocuments();
    return orderCount;
  }

  async nbDeliveries() {
    if (!(await this.isConnected())) {
      return -1;
    }
    const deliveriesCollection = this.db.collection('deliveries');
    const deliveryCount = await deliveriesCollection.countDocuments();
    return deliveryCount;
  }
}

const mongoClient = DBClient.getInstance();
mongoClient.connect().catch(console.error);

export default mongoClient;
