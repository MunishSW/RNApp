import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SessionFlagsState {
  /** Set true when Contact Us opens so the popup shows its pre-login variant */
  isNonLoggedUser: boolean;
  /** Set true on every FAQs tap so FAQ back returns to Home */
  faqsFromNonLogin: boolean;
  /** A stale 'changePassword' origin must not lock the Register Now CIF field */
  registerNowReturnScreen: string | null;
}

const initialState: SessionFlagsState = {
  isNonLoggedUser: false,
  faqsFromNonLogin: false,
  registerNowReturnScreen: null,
};

const sessionFlagsSlice = createSlice({
  name: 'sessionFlags',
  initialState,
  reducers: {
    setIsNonLoggedUser(state, action: PayloadAction<boolean>) {
      state.isNonLoggedUser = action.payload;
    },
    setFaqsFromNonLogin(state, action: PayloadAction<boolean>) {
      state.faqsFromNonLogin = action.payload;
    },
    setRegisterNowReturnScreen(state, action: PayloadAction<string | null>) {
      state.registerNowReturnScreen = action.payload;
    },
  },
});

export const { setIsNonLoggedUser, setFaqsFromNonLogin, setRegisterNowReturnScreen } =
  sessionFlagsSlice.actions;
export default sessionFlagsSlice.reducer;
