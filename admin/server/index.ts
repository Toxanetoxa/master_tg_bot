import crypto from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config({ path: './.env' });

const { Pool } = pg;

const PORT = Number(process.env.ADMIN_API_PORT || 5174);
const DATABASE_URL = process.env.DATABASE_URL;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET || 'change-me';
const AUTH_DISABLED = process.env.ADMIN_AUTH_DISABLED === 'true';

if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');
if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN or BOT_TOKEN');

const pool = new Pool({ connectionString: DATABASE_URL });

const app = express();
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

type TelegramAuthPayload = {
  id: number;
  hash: string;
  auth_date: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type AdminUser = {
  id: number;
  tg_user_id: number;
  username: string | null;
  first_name: string | null;
  role: string;
};

type AppUser = {
  id: number;
  tg_user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
  last_seen_at: string | null;
};

type PaymentRow = {
  id: number;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  tg_user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
};

const buildDataCheckString = (data: Record<string, string | number>) => {
  const pairs = Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`);
  return pairs.join('\n');
};

const getTelegramSecret = () => {
  return crypto.createHash('sha256').update(BOT_TOKEN).digest();
};

const verifyTelegramAuth = (data: Record<string, string | number>) => {
  if (!data.hash) return false;
  const secretKey = getTelegramSecret();
  const checkString = buildDataCheckString(data);
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  return hmac === data.hash;
};

const signSession = (payload: Record<string, string | number>) => {
  const json = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', COOKIE_SECRET).update(json).digest('hex');
  return Buffer.from(`${json}.${signature}`).toString('base64');
};

const verifySession = (token: string) => {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const [json, signature] = raw.split('.');
    const expected = crypto.createHmac('sha256', COOKIE_SECRET).update(json).digest('hex');
    if (signature !== expected) return null;
    return JSON.parse(json) as { tg_user_id: number };
  } catch {
    return null;
  }
};

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (AUTH_DISABLED) {
    (req as Request & { admin: AdminUser }).admin = {
      id: 0,
      tg_user_id: 0,
      username: 'dev',
      first_name: 'Dev',
      role: 'admin',
    };
    return next();
  }
  const token = req.cookies?.admin_session as string | undefined;
  if (!token) return res.status(401).send('unauthorized');
  const data = verifySession(token);
  if (!data?.tg_user_id) return res.status(401).send('unauthorized');
  const { rows } = await pool.query<AdminUser>(
    'SELECT id, tg_user_id, username, first_name, role FROM users WHERE tg_user_id = $1',
    [data.tg_user_id],
  );
  if (!rows.length || rows[0].role !== 'admin') return res.status(403).send('forbidden');
  (req as Request & { admin: AdminUser }).admin = rows[0];
  next();
};

app.post('/auth/telegram', async (req: Request, res: Response) => {
  if (AUTH_DISABLED) return res.json({ ok: true });
  const data = req.body as TelegramAuthPayload;
  if (!verifyTelegramAuth(data as Record<string, string | number>)) {
    return res.status(401).send('invalid auth');
  }

  const tgUserId = Number(data.id);
  const { rows } = await pool.query<AdminUser>(
    'SELECT id, tg_user_id, username, first_name, role FROM users WHERE tg_user_id = $1',
    [tgUserId],
  );
  if (!rows.length || rows[0].role !== 'admin') return res.status(403).send('forbidden');

  const token = signSession({ tg_user_id: tgUserId, ts: Date.now() });
  res.cookie('admin_session', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

app.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('admin_session');
  res.json({ ok: true });
});

app.get('/auth/me', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as Request & { admin: AdminUser }).admin;
  res.json(admin);
});

app.get('/api/days', requireAdmin, async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM bot_days ORDER BY day_number');
  res.json(rows);
});

app.get('/api/users', requireAdmin, async (_req: Request, res: Response) => {
  const { rows } = await pool.query<AppUser>(
    'SELECT id, tg_user_id, username, first_name, last_name, role, created_at, last_seen_at FROM users ORDER BY id DESC',
  );
  res.json(rows);
});

app.get('/api/payments', requireAdmin, async (_req: Request, res: Response) => {
  const { rows } = await pool.query<PaymentRow>(
    `SELECT p.id, p.payment_id, p.amount, p.currency, p.status, p.created_at,
            u.tg_user_id, u.username, u.first_name, u.last_name
     FROM payments p
     LEFT JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT 200`,
  );
  res.json(rows);
});

app.get('/api/analytics', requireAdmin, async (_req: Request, res: Response) => {
  const monthlyRevenue = await pool.query<{ month: string; total: number }>(
    `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
            COALESCE(SUM(amount), 0) AS total
     FROM payments
     WHERE status = 'succeeded'
     GROUP BY 1
     ORDER BY 1`,
  );
  const monthlySubscriptions = await pool.query<{ month: string; count: number }>(
    `SELECT to_char(date_trunc('month', start_at), 'YYYY-MM') AS month,
            COUNT(*) AS count
     FROM subscriptions
     WHERE status = 'active' AND plan = 'premium'
     GROUP BY 1
     ORDER BY 1`,
  );
  const dayProgress = await pool.query<{ day: number; count: number }>(
    `SELECT day, COUNT(*) AS count
     FROM user_state
     GROUP BY day
     ORDER BY day`,
  );
  const totals = await pool.query<{ revenue: number; subscriptions: number }>(
    `SELECT
       COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'succeeded'), 0) AS revenue,
       COALESCE((SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan = 'premium'), 0) AS subscriptions`,
  );

  res.json({
    monthlyRevenue: monthlyRevenue.rows,
    monthlySubscriptions: monthlySubscriptions.rows,
    dayProgress: dayProgress.rows,
    totals: totals.rows[0],
  });
});

app.post('/api/days', requireAdmin, async (req: Request, res: Response) => {
  const { day_number, is_premium, reminders } = req.body as {
    day_number: number;
    is_premium: boolean;
    reminders?: string | null;
  };
  const { rows } = await pool.query(
    'INSERT INTO bot_days (day_number, is_premium, reminders) VALUES ($1, $2, $3) RETURNING *',
    [day_number, !!is_premium, reminders || null],
  );
  res.json(rows[0]);
});

app.put('/api/days/:id', requireAdmin, async (req: Request, res: Response) => {
  const { day_number, is_premium, reminders } = req.body as {
    day_number: number;
    is_premium: boolean;
    reminders?: string | null;
  };
  const { rows } = await pool.query(
    'UPDATE bot_days SET day_number = $1, is_premium = $2, reminders = $3 WHERE id = $4 RETURNING *',
    [day_number, !!is_premium, reminders || null, req.params.id],
  );
  res.json(rows[0]);
});

app.delete('/api/days/:id', requireAdmin, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM bot_days WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/days/:dayId/messages', requireAdmin, async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    'SELECT * FROM bot_messages WHERE day_id = $1 ORDER BY step_index',
    [req.params.dayId],
  );
  res.json(rows);
});

app.get('/api/days/:dayId/feedback-buttons', requireAdmin, async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT b.message_id
     FROM bot_feedback_buttons b
     JOIN bot_messages m ON m.id = b.message_id
     WHERE m.day_id = $1`,
    [req.params.dayId],
  );
  res.json(rows.map((r) => r.message_id));
});

app.post('/api/days/:dayId/messages', requireAdmin, async (req: Request, res: Response) => {
  const { step_index, message_text, reminder_text } = req.body as {
    step_index: number;
    message_text: string;
    reminder_text?: string | null;
  };
  const conflict = await pool.query(
    'SELECT 1 FROM bot_messages WHERE day_id = $1 AND step_index = $2',
    [req.params.dayId, step_index],
  );
  if (conflict.rowCount) {
    return res.status(409).send('step_index already exists for this day');
  }
  const { rows } = await pool.query(
    'INSERT INTO bot_messages (day_id, step_index, message_text, reminder_text) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.params.dayId, step_index, message_text, reminder_text ?? null],
  );
  res.json(rows[0]);
});

app.put('/api/messages/:id', requireAdmin, async (req: Request, res: Response) => {
  const { step_index, message_text, reminder_text } = req.body as {
    step_index: number;
    message_text: string;
    reminder_text?: string | null;
  };
  const dayRow = await pool.query('SELECT day_id FROM bot_messages WHERE id = $1', [req.params.id]);
  if (!dayRow.rows.length) return res.status(404).send('message not found');
  const dayId = dayRow.rows[0].day_id as number;
  const conflict = await pool.query(
    'SELECT 1 FROM bot_messages WHERE day_id = $1 AND step_index = $2 AND id <> $3',
    [dayId, step_index, req.params.id],
  );
  if (conflict.rowCount) {
    return res.status(409).send('step_index already exists for this day');
  }
  const { rows } = await pool.query(
    'UPDATE bot_messages SET step_index = $1, message_text = $2, reminder_text = $3 WHERE id = $4 RETURNING *',
    [step_index, message_text, reminder_text ?? null, req.params.id],
  );
  res.json(rows[0]);
});

app.delete('/api/messages/:id', requireAdmin, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM bot_messages WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/messages/:messageId/feedback', requireAdmin, async (req: Request, res: Response) => {
  const buttons = await pool.query(
    'SELECT * FROM bot_feedback_buttons WHERE message_id = $1 ORDER BY id',
    [req.params.messageId],
  );
  const messages = await pool.query(
    'SELECT * FROM bot_feedback_messages WHERE message_id = $1 ORDER BY id',
    [req.params.messageId],
  );
  res.json({ buttons: buttons.rows, messages: messages.rows });
});

app.post(
  '/api/messages/:messageId/feedback/buttons',
  requireAdmin,
  async (req: Request, res: Response) => {
    const { type, text } = req.body as { type: string; text: string };
    const { rows } = await pool.query(
      'INSERT INTO bot_feedback_buttons (message_id, type, text) VALUES ($1, $2, $3) RETURNING *',
      [req.params.messageId, type, text],
    );
    res.json(rows[0]);
  },
);

app.post(
  '/api/messages/:messageId/feedback/messages',
  requireAdmin,
  async (req: Request, res: Response) => {
    const { type, message_text } = req.body as { type: string; message_text: string };
    const { rows } = await pool.query(
      'INSERT INTO bot_feedback_messages (message_id, type, message_text) VALUES ($1, $2, $3) RETURNING *',
      [req.params.messageId, type, message_text],
    );
    res.json(rows[0]);
  },
);

app.put('/api/feedback/buttons/:id', requireAdmin, async (req: Request, res: Response) => {
  const { type, text } = req.body as { type: string; text: string };
  const { rows } = await pool.query(
    'UPDATE bot_feedback_buttons SET type = $1, text = $2 WHERE id = $3 RETURNING *',
    [type, text, req.params.id],
  );
  res.json(rows[0]);
});

app.put('/api/feedback/messages/:id', requireAdmin, async (req: Request, res: Response) => {
  const { type, message_text } = req.body as { type: string; message_text: string };
  const { rows } = await pool.query(
    'UPDATE bot_feedback_messages SET type = $1, message_text = $2 WHERE id = $3 RETURNING *',
    [type, message_text, req.params.id],
  );
  res.json(rows[0]);
});

app.delete('/api/feedback/buttons/:id', requireAdmin, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM bot_feedback_buttons WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/feedback/messages/:id', requireAdmin, async (req: Request, res: Response) => {
  await pool.query('DELETE FROM bot_feedback_messages WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Admin API listening on ${PORT}`);
});
