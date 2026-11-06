import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OffersFormState {
  fullName: string;
  mobileNo: string;
  tncAccepted: boolean;
}

export interface OffersState {
  form: OffersFormState;
  /** Selected pre-approved offer; shape is owned by the Offers module */
  selectedOffer: Record<string, unknown> | null;
}

export const initialOffersState: OffersState = {
  form: { fullName: '', mobileNo: '', tncAccepted: false },
  selectedOffer: null,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState: initialOffersState,
  reducers: {
    setOffersForm(state, action: PayloadAction<Partial<OffersFormState>>) {
      state.form = { ...state.form, ...action.payload };
    },
    setSelectedOffer(state, action: PayloadAction<Record<string, unknown> | null>) {
      state.selectedOffer = action.payload;
    },
    resetOffersForm(state) {
      state.form = initialOffersState.form;
    },
    clearSelectedOffer(state) {
      state.selectedOffer = null;
    },
  },
});

export const { setOffersForm, setSelectedOffer, resetOffersForm, clearSelectedOffer } =
  offersSlice.actions;
export default offersSlice.reducer;
