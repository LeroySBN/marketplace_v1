import { Request, Response } from "express";
import { BaseObject } from "./main";
import mongoClient from "../utils/mongo";
import { parse } from "path";

export interface Product extends BaseObject {
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
  category?: string;
}

// Get list of products with pagination (10 per page) & filter by category

class ProductsController {
  static async getProducts(req: Request, res: Response): Promise<Response | void> {
    let page: number | null = parseInt(req.query.page as string, 10);
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }
    
    const pageSize: number = 10;
    const skip: number = (page - 1) * pageSize;

    const products = await mongoClient.db.collection('products');
    
    const result = await products.find().skip(skip).limit(pageSize).toArray();

    return res.status(200).json(result);
  }
}

export default ProductsController;
