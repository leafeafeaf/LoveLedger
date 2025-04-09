import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AccountVerifyResponse, AccountVerifyConfirmResponse } from "../types";

interface AccountState {
  verifiedAccount: AccountVerifyResponse | null;
  confirmedAccount: AccountVerifyConfirmResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  verifiedAccount: null,
  confirmedAccount: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setVerifiedAccount: (
      state,
      action: PayloadAction<AccountVerifyResponse>
    ) => {
      state.verifiedAccount = action.payload;
      state.error = null;
    },
    setConfirmedAccount: (
      state,
      action: PayloadAction<AccountVerifyConfirmResponse>
    ) => {
      state.confirmedAccount = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.verifiedAccount = null;
      state.confirmedAccount = null;
    },
    resetAccountState: (state) => {
      state.verifiedAccount = null;
      state.confirmedAccount = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setVerifiedAccount,
  setConfirmedAccount,
  setLoading,
  setError,
  resetAccountState,
} = accountSlice.actions;

export default accountSlice.reducer;
