import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/** In-memory guest sessions: token -> nickname */
const sessions = new Map<string, string>();

/**
 * POST /api/auth/guest
 * Body: { nickname?: string }
 * Returns: { token, nickname }
 */
router.post('/guest', (req: Request, res: Response) => {
  const nickname: string =
    (typeof req.body?.nickname === 'string' && req.body.nickname.trim())
      ? req.body.nickname.trim().slice(0, 32)
      : `Guest_${Math.floor(Math.random() * 9000) + 1000}`;

  const token = uuidv4();
  sessions.set(token, nickname);

  res.json({ token, nickname });
});

export { sessions };
export default router;
