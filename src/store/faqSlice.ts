import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqState {
  /** null = nothing cached yet */
  items: FaqItem[] | null;
}

const initialState: FaqState = { items: null };

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    setFaqItems(state, action: PayloadAction<FaqItem[]>) {
      state.items = action.payload;
    },
    /** For example on logout. Home never calls this (BR-11). */
    clearFaq(state) {
      state.items = null;
    },
  },
});

export const { setFaqItems, clearFaq } = faqSlice.actions;
export default faqSlice.reducer;
