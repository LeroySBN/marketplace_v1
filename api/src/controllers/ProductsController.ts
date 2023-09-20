import { Request, Response } from 'express';

import mongoClient from '../utils/mongo';


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
