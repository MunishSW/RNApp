import { configureStore } from '@reduxjs/toolkit';
import faqReducer from './faqSlice';
import offersReducer from './offersSlice';
import sessionFlagsReducer from './sessionFlagsSlice';
import tokenReducer from './tokenSlice';

export function createAppStore() {
  return configureStore({
    reducer: {
      token: tokenReducer,
      faq: faqReducer,
      offers: offersReducer,
      sessionFlags: sessionFlagsReducer,
    },
  });
}

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
