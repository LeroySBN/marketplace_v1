import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import AppController from '../controllers/AppController';
import VendorsController from '../controllers/VendorsController';
import UsersController from '../controllers/UsersController';
import ProductsController from '../controllers/ProductsController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
// Auth routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
// Vendors routes
router.post('/vendors', VendorsController.postVendor);
router.get('/vendors/me', VendorsController.getMe);
router.put('/vendors/me/product', VendorsController.putVendorProduct);
// Products routes
router.get('/products', ProductsController.getProducts);
// TODO: add category controller method + route
// router.get('/products/category', ProductsController.getProductsCategory);
// Users routes
router.post('/users', UsersController.postUser);
router.get('/users/me', UsersController.getMe);
router.put('/users/me/cart', UsersController.putUserCart);
// router.delete('/users/me/cart', UsersController.deleteUserCart); // TODO

export default router;
