import { Router } from 'express';
import AppController from '../controllers/AppController';
import VendorsController from '../controllers/VendorsController';
import UsersController from '../controllers/UsersController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
// Vendors routes
router.post('/vendors', VendorsController.postVendor);
router.get('/vendors/me', VendorsController.getMe);
// Users routes
router.post('/users', UsersController.postUser);
router.get('/users/me', UsersController.getMe);

export default router;
