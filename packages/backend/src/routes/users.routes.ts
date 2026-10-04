import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import type { UserService } from '../types/services';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
export const createUsersRouter = (userService: UserService): Router => { const router = Router(); router.use(authenticate); router.get('/profile', asyncHandler(async (req, res) => { sendSuccess(res, { data: await userService.getProfile(req.user!.id) }); })); router.put('/profile', validateRequest([body('firstName').optional().isString().trim().isLength({ min: 1, max: 100 }), body('lastName').optional().isString().trim().isLength({ min: 1, max: 100 }), body('phone').optional({ nullable: true }).isString().trim().isLength({ min: 6, max: 20 })]), asyncHandler(async (req, res) => { sendSuccess(res, { message: 'Profile updated successfully', data: await userService.updateProfile(req.user!.id, req.body) }); })); router.get('/:id', requireAdmin, validateRequest([param('id').isUUID()]), asyncHandler(async (req, res) => { sendSuccess(res, { data: await userService.getUserById(String(req.params.id)) }); })); return router; };
