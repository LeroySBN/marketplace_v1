import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import VendorsController from '../controllers/VendorsController';
import ProductsController from '../controllers/ProductsController';

const router = Router();

// Health check route
router.get('/health', AppController.getHealth);

// App status routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Auth routes
router.post('/auth/signin', AuthController.signIn);
router.post('/auth/signup', AuthController.signUp);

// User routes
router.post('/users', UsersController.createUser);
router.get('/users/:id', UsersController.getUser);
router.put('/users/:id', UsersController.updateUser);
router.delete('/users/:id', UsersController.deleteUser);
router.get('/users/:id/products', UsersController.getUserProducts);
router.get('/users/:id/orders', UsersController.getUserOrders);
router.get('/users/:id/deliveries', UsersController.getUserDeliveries);

// Vendor routes
router.post('/vendors', VendorsController.createVendor);
router.get('/vendors/:id', VendorsController.getVendor);
router.put('/vendors/:id', VendorsController.updateVendor);
router.delete('/vendors/:id', VendorsController.deleteVendor);
router.get('/vendors/:id/products', VendorsController.getVendorProducts);
router.post('/vendors/:id/products', VendorsController.addVendorProduct);
router.delete('/vendors/:id/products/:productId', VendorsController.removeVendorProduct);

// Product routes
router.get('/products', ProductsController.getProducts);
router.get('/products/:id', ProductsController.getProduct);

export default router;
