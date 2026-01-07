import { AppConfig, parseTime } from '../config.ts';
import { getSchedulerSettings, getTimezoneOffsetsByTgUserIds, clearSchedulerStartNow } from '../db/repositories.ts';
import { StateStore } from '../types/state.ts';

type SchedulerDeps = {
  config: AppConfig;
  state: StateStore;
  startDay: (chatId: number, day: number) => Promise<void>;
};

export const createScheduler = (deps: SchedulerDeps) => {
  const run = () => {
    if (deps.config.mode !== 'prod') return;
    let tickInFlight = false;
    const tick = async () => {
      if (tickInFlight) return;
      tickInFlight = true;
      try {
        const settings = await getSchedulerSettings(deps.config.dailySendTime);
        const scheduledEntries = Array.from(deps.state.entries()).filter(
          ([, state]) => state.status === 'scheduled',
        );
        if (!scheduledEntries.length) return;

        if (settings.start_now_requested_at) {
          for (const [chatId, state] of scheduledEntries) {
            await deps.startDay(chatId, state.day);
          }
          await clearSchedulerStartNow();
          return;
        }

        const { hours, minutes } = parseTime(settings.daily_send_time);
        const now = new Date();
        const ids = scheduledEntries.map(([chatId]) => chatId);
        const offsets = await getTimezoneOffsetsByTgUserIds(ids);
        for (const [chatId, state] of scheduledEntries) {
          const offsetMin = offsets.get(chatId) ?? 0;
          const local = new Date(now.getTime() + offsetMin * 60_000);
          if (local.getHours() === hours && local.getMinutes() === minutes) {
            await deps.startDay(chatId, state.day);
          }
        }
      } catch (err) {
        console.error('Scheduler tick failed', err);
      } finally {
        tickInFlight = false;
      }
    };

    setInterval(() => {
      void tick();
    }, 60_000);
    void tick();
  };

  return { run };
};
