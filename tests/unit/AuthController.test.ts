import { ObjectId } from 'mongodb';
import AuthController from '../../api/v1/src/controllers/AuthController';
import redisClient from '../../api/v1/src/utils/redis';
import { mockRequest, mockResponse, createTestUser } from '../helpers';

describe('AuthController', () => {
  describe('getConnect', () => {
    it('should authenticate user with valid credentials', async () => {
      // Create test user
      const userId = new ObjectId();
      await createTestUser({
        _id: userId,
        email: 'test@example.com',
        password: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8' // "password" in sha1
      });

      // Create mock request with Base64 encoded "test@example.com:password"
      const req = mockRequest({
        headers: {
          'Authorization': 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='
        }
      });
      const res = mockResponse();

      await AuthController.getConnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String)
        })
      );

      // Verify token was stored in Redis
      const token = (res.json as jest.Mock).mock.calls[0][0].token;
      const storedUserId = await redisClient.get(`auth_${token}`);
      expect(storedUserId).toBe(userId.toString());
    });

    it('should return 401 for invalid credentials', async () => {
      const req = mockRequest({
        headers: {
          'Authorization': 'Basic aW52YWxpZEBleGFtcGxlLmNvbTp3cm9uZ3Bhc3N3b3Jk'
        }
      });
      const res = mockResponse();

      await AuthController.getConnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should return 401 for missing authorization header', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await AuthController.getConnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
  });

  describe('getDisconnect', () => {
    it('should successfully disconnect user with valid token', async () => {
      const token = 'valid-token';
      const userId = new ObjectId().toString();
      await redisClient.set(`auth_${token}`, userId);

      const req = mockRequest({
        headers: {
          'X-Token': token
        }
      });
      const res = mockResponse();

      await AuthController.getDisconnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(204);
      
      // Verify token was removed from Redis
      const storedUserId = await redisClient.get(`auth_${token}`);
      expect(storedUserId).toBeNull();
    });

    it('should return 401 for invalid token', async () => {
      const req = mockRequest({
        headers: {
          'X-Token': 'invalid-token'
        }
      });
      const res = mockResponse();

      await AuthController.getDisconnect(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
  });
});
