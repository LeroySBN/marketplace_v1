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
router.post('/vendors', VendorsController.postVendor); // data = { email: string, password: string }
router.get('/vendors/me', VendorsController.getMe); // get authenticated vendor info
router.post('/vendors/products', VendorsController.postVendorProduct); // adds one product
router.put('/vendors/products', VendorsController.putVendorProduct); // updates one product
router.delete('/vendors/products/:id', VendorsController.delVendorProduct); // deletes product
router.get('/vendors/products', VendorsController.getVendorProducts); // get all products - has pagination
router.get('/vendors/orders', VendorsController.getVendorOrders); // get all orders - no pagination
// Products routes
router.get('/products', ProductsController.getProducts); // get all products - has pagination
// TODO: router.get('/products/:id', ProductsController.getProductsIndex);
// TODO: router.get('/products/category', ProductsController.getProductsByCategory);
// TODO: router.get('/products/category/:id', ProductsController.getProductsIndexByCategory);
// Users routes
router.post('/users', UsersController.postUser); // data = { email: string, password: string }
router.get('/users/me', UsersController.getMe); // get authenticated user info
router.post('/users/cart', UsersController.postUserCart); // adds one item to cart
// router.put('/users/cart', UsersController.putUserCart); // updates item in cart
router.delete('/users/cart/:id', UsersController.deleteUserCartItem); // deletes one item in cart
router.get('/users/cart/checkout', UsersController.getUserCheckout); // get cart items - no pagination
router.post('/users/orders', UsersController.postUserOrder); // Confirms cart and creates order
router.get('/users/orders', UsersController.getUserOrders); // get all orders - no pagination

export default router;
