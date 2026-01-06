import 'jsr:@std/dotenv@0.224.0/load';

export type AppMode = 'dev' | 'prod';

export type AppConfig = {
  token: string;
  mode: AppMode;
  dailySendTime: string; // HH:MM
};

export const loadConfig = (): AppConfig => {
  const token = Deno.env.get('BOT_TOKEN');
  if (!token) {
    throw new Error('Missing BOT_TOKEN in environment variables');
  }

  const modeEnv = (Deno.env.get('BOT_MODE') ?? 'dev').toLowerCase();
  const mode: AppMode = modeEnv === 'prod' ? 'prod' : 'dev';
  const dailySendTime = Deno.env.get('DAILY_SEND_TIME') ?? '10:00';

  return { token, mode, dailySendTime };
};

export const parseTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return { hours: h ?? 10, minutes: m ?? 0 };
};
