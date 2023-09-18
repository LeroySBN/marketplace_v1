// MongoDB utils
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.MONGODB_HOST || 'localhost';
const port = process.env.MONGODB_PORT || 27017;
const database = process.env.MONGODB_DATABASE || 'procurement_ms';

const url = `mongodb://${host}:${port}`;

class MongoDBClient {
  client: MongoClient | null = null;
  db: any;

  constructor() {
    this.connectToMongo();
  }

  private async connectToMongo() {
    try {
      this.client = new MongoClient(url);
      await this.client.connect();
      this.db = this.client.db(`${database}`);
      console.log('Connected to MongoDB');
    } catch (error: any) {
      console.error('MongoDB connection error:', error.message);
      this.client = null; // Set client to null on error
    }
  }

  isAlive(): boolean {
    return !!this.client && !!this.db;
  }

  async nbUsers() {
    if (!this.isAlive()) {
      return -1;
    }
    const usersCollection = this.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    return userCount;
  }

  async nbVendors() {
    if (!this.isAlive()) {
      return -1;
    }
    const vendorsCollection = this.db.collection('vendors');
    const vendorCount = await vendorsCollection.countDocuments();
    return vendorCount;
  }

  async nbProducts() {
    if (!this.isAlive()) {
      return -1;
    }
    const productsCollection = this.db.collection('products');
    const productCount = await productsCollection.countDocuments();
    return productCount;
  }

  async nbOrders() {
    if (!this.isAlive()) {
      return -1;
    }
    const ordersCollection = this.db.collection('orders');
    const orderCount = await ordersCollection.countDocuments();
    return orderCount;
  }
}

const mongoClient = new MongoDBClient();

export default mongoClient;
