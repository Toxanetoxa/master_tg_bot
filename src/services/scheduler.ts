import { AppConfig, parseTime } from '../config.ts';
import { StateStore } from '../types/state.ts';

type SchedulerDeps = {
  config: AppConfig;
  state: StateStore;
  startDay: (chatId: number, day: number) => Promise<void>;
};

export const createScheduler = (deps: SchedulerDeps) => {
  const run = () => {
    if (deps.config.mode !== 'prod') return;
    const { hours, minutes } = parseTime(deps.config.dailySendTime);
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        for (const [chatId, state] of deps.state.entries()) {
          if (state.status !== 'scheduled') continue;
          deps.startDay(chatId, state.day);
        }
      }
    }, 60_000);
  };

  return { run };
};
