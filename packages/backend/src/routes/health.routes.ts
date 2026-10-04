import { Router } from 'express';
import type { HealthService } from '../types/services';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
export const createHealthRouter = (healthService: HealthService): Router => { const router = Router(); router.get('/live', (_req, res) => { sendSuccess(res, { data: healthService.checkLiveness() }); }); router.get('/ready', asyncHandler(async (_req, res) => { sendSuccess(res, { data: await healthService.checkReadiness() }); })); return router; };
