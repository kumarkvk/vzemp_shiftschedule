import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import type { CartService } from '../types/services';
import { asyncHandler } from '../utils/async-handler';
import { sendNoContent, sendSuccess } from '../utils/api-response';
export const createCartRouter = (cartService: CartService): Router => { const router = Router(); router.use(authenticate); router.get('/', asyncHandler(async (req, res) => { sendSuccess(res, { data: await cartService.getCart(req.user!.id) }); })); router.post('/items', validateRequest([body('productId').isUUID(), body('quantity').isInt({ min: 1 }).toInt()]), asyncHandler(async (req, res) => { sendSuccess(res, { statusCode: 201, message: 'Item added to cart', data: await cartService.addItem(req.user!.id, req.body) }); })); router.put('/items/:id', validateRequest([param('id').isUUID(), body('quantity').isInt({ min: 1 }).toInt()]), asyncHandler(async (req, res) => { sendSuccess(res, { message: 'Cart item updated successfully', data: await cartService.updateItem(req.user!.id, String(req.params.id), req.body) }); })); router.delete('/items/:id', validateRequest([param('id').isUUID()]), asyncHandler(async (req, res) => { await cartService.removeItem(req.user!.id, String(req.params.id)); sendNoContent(res); })); router.delete('/', asyncHandler(async (req, res) => { await cartService.clearCart(req.user!.id); sendNoContent(res); })); return router; };
