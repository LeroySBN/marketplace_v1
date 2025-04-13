// MongoDB utils
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.MONGODB_HOST || 'localhost';
const port = parseInt(process.env.MONGODB_PORT || '27017', 10);
const database = process.env.MONGODB_DATABASE || 'marketplace_db';
const url = process.env.MONGO_URL || `mongodb://${host}:${port}`;

class MongoDBClient {
  client: MongoClient;
  db: any;

  constructor() {
    this.client = new MongoClient(url, {
        useUnifiedTopology: true,
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
    });

    try {
      this.client.connect().then(() => {
        this.db = this.client.db(database);
      }).catch((err) => {
        console.log(err);
      });
    } catch (err) {
      console.log(err);
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

  async nbDeliveries() {
    if (!this.isAlive()) {
      return -1;
    }
    const deliveriesCollection = this.db.collection('deliveries');
    const deliveryCount = await deliveriesCollection.countDocuments();
    return deliveryCount;
  }
}

const mongoClient = new MongoDBClient();

export default mongoClient;
