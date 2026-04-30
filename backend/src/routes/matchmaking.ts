import { Router, Request, Response } from 'express';
import { sessions } from './auth';
import { getQueueLength } from '../matchmaking/queue';

const router = Router();

/**
 * POST /api/matchmaking/enqueue
 * Body: { token: string }
 * Returns: { queued: true, position: number }
 *
 * Note: Actual matchmaking happens over Socket.IO.
 * This REST endpoint is an optional entry point for clients that prefer HTTP.
 */
router.post('/enqueue', (req: Request, res: Response) => {
  const token: unknown = req.body?.token;
  if (typeof token !== 'string' || !sessions.has(token)) {
    res.status(401).json({ error: 'Invalid or missing token' });
    return;
  }

  // Signal client to connect via Socket.IO for real matchmaking
  res.json({ queued: true, position: getQueueLength() + 1 });
});

export default router;
