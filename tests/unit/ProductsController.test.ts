import { ObjectId } from 'mongodb';
import ProductsController from '../../api/v1/src/controllers/ProductsController';
import redisClient from '../../api/v1/src/utils/redis';
import { mockRequest, mockResponse, createTestProduct } from '../helpers';

describe('ProductsController', () => {
  describe('getProducts', () => {
    beforeEach(async () => {
      // Create test products
      await Promise.all([
        createTestProduct({
          name: 'Product 1',
          price: 100,
          category: 'electronics'
        }),
        createTestProduct({
          name: 'Product 2',
          price: 200,
          category: 'electronics'
        }),
        createTestProduct({
          name: 'Product 3',
          price: 300,
          category: 'clothing'
        })
      ]);
    });

    it('should return paginated products', async () => {
      const req = mockRequest({
        query: {
          page: '1',
          limit: '2'
        }
      });
      const res = mockResponse();

      await ProductsController.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              price: expect.any(Number)
            })
          ]),
          total: 3,
          page: 1,
          totalPages: 2,
          hasMore: true
        })
      );
    });

    it('should filter products by category', async () => {
      const req = mockRequest({
        query: {
          category: 'electronics'
        }
      });
      const res = mockResponse();

      await ProductsController.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.data).toHaveLength(2);
      expect(response.data.every((p: any) => p.category === 'electronics')).toBe(true);
    });

    it('should filter products by price range', async () => {
      const req = mockRequest({
        query: {
          minPrice: '150',
          maxPrice: '250'
        }
      });
      const res = mockResponse();

      await ProductsController.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.data.every((p: any) => p.price >= 150 && p.price <= 250)).toBe(true);
    });

    it('should sort products by price', async () => {
      const req = mockRequest({
        query: {
          sortBy: 'price',
          sortOrder: 'desc'
        }
      });
      const res = mockResponse();

      await ProductsController.getProducts(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = (res.json as jest.Mock).mock.calls[0][0];
      const prices = response.data.map((p: any) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should use cache for repeated queries', async () => {
      const req = mockRequest({
        query: {
          category: 'electronics'
        }
      });
      const res1 = mockResponse();
      const res2 = mockResponse();

      // First call
      await ProductsController.getProducts(req as any, res1 as any);
      expect(res1.status).toHaveBeenCalledWith(200);

      // Second call should use cache
      await ProductsController.getProducts(req as any, res2 as any);
      expect(res2.status).toHaveBeenCalledWith(200);

      // Both responses should be identical
      expect(res1.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array)
        })
      );
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array)
        })
      );
      expect((res1.json as jest.Mock).mock.calls[0][0]).toEqual(
        (res2.json as jest.Mock).mock.calls[0][0]
      );
    });
  });

  describe('getProduct', () => {
    let testProduct: any;

    beforeEach(async () => {
      const result = await createTestProduct();
      testProduct = result;
    });

    it('should return a single product by id', async () => {
      const req = mockRequest({
        params: {
          id: testProduct.insertedId.toString()
        }
      });
      const res = mockResponse();

      await ProductsController.getProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(ObjectId),
          name: 'Test Product',
          price: 99.99
        })
      );
    });

    it('should return 404 for non-existent product', async () => {
      const req = mockRequest({
        params: {
          id: new ObjectId().toString()
        }
      });
      const res = mockResponse();

      await ProductsController.getProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should return 400 for invalid product id', async () => {
      const req = mockRequest({
        params: {
          id: 'invalid-id'
        }
      });
      const res = mockResponse();

      await ProductsController.getProduct(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should use cache for repeated requests', async () => {
      const req = mockRequest({
        params: {
          id: testProduct.insertedId.toString()
        }
      });
      const res1 = mockResponse();
      const res2 = mockResponse();

      // First call
      await ProductsController.getProduct(req as any, res1 as any);
      expect(res1.status).toHaveBeenCalledWith(200);

      // Second call should use cache
      await ProductsController.getProduct(req as any, res2 as any);
      expect(res2.status).toHaveBeenCalledWith(200);

      // Both responses should be identical
      expect((res1.json as jest.Mock).mock.calls[0][0]).toEqual(
        (res2.json as jest.Mock).mock.calls[0][0]
      );
    });
  });
});
