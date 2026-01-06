export type UserStatus = 'active' | 'scheduled' | 'blocked';

export type UserState = {
  day: number;
  messageIndex: number;
  status: UserStatus;
};

export type StateStore = Map<number, UserState>;

export const createStateStore = (): StateStore => new Map<number, UserState>();
