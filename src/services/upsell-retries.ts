import { getDueUpsellRetries } from '../db/repositories.ts';

export const processUpsellRetries = async (
  retry: (chatId: number) => Promise<void>,
) => {
  const rows = await getDueUpsellRetries(new Date());
  for (const row of rows) {
    await retry(row.tg_user_id);
  }
};
