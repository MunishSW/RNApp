import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TokenState {
  /** App-level (non-logged) token: memory, mirrored to encrypted storage by authService */
  nonLoggedToken: string | null;
  /** Logged-in token: memory only, never persisted, never reused as the non-logged token */
  loggedInToken: string | null;
}

const initialState: TokenState = { nonLoggedToken: null, loggedInToken: null };

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setNonLoggedToken(state, action: PayloadAction<string>) {
      state.nonLoggedToken = action.payload;
    },
    clearNonLoggedToken(state) {
      state.nonLoggedToken = null;
    },
    setLoggedInToken(state, action: PayloadAction<string | null>) {
      state.loggedInToken = action.payload;
    },
  },
});

export const { setNonLoggedToken, clearNonLoggedToken, setLoggedInToken } =
  tokenSlice.actions;
export default tokenSlice.reducer;
