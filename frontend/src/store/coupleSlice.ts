import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { unlinkCouple } from "../api/couple";
import { CoupleUnlinkResponse } from "../types/couple";

interface CoupleState {
  error: string | null;
  isUnlinking: boolean;
  unlinkSuccess: boolean;
  lastUnlinkTimestamp: string | null;
}

const initialState: CoupleState = {
  error: null,
  isUnlinking: false,
  unlinkSuccess: false,
  lastUnlinkTimestamp: null,
};

// 비동기 액션 생성자
export const unlinkCoupleAsync = createAsyncThunk(
  "couple/unlinkCouple",
  async (coupleId: string, { rejectWithValue }) => {
    try {
      const response = await unlinkCouple(coupleId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const coupleSlice = createSlice({
  name: "couple",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUnlinkState: (state) => {
      state.isUnlinking = false;
      state.unlinkSuccess = false;
      state.lastUnlinkTimestamp = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(unlinkCoupleAsync.pending, (state) => {
        state.isUnlinking = true;
        state.error = null;
        state.unlinkSuccess = false;
      })
      .addCase(unlinkCoupleAsync.fulfilled, (state, action) => {
        state.isUnlinking = false;
        state.unlinkSuccess = true;
        state.lastUnlinkTimestamp = action.payload.timestamp;
        state.error = null;
      })
      .addCase(unlinkCoupleAsync.rejected, (state, action) => {
        state.isUnlinking = false;
        state.unlinkSuccess = false;
        state.error = "부부 연동 해제 중 오류가 발생했습니다.";
      });
  },
});

export const { setError, clearError, resetUnlinkState } = coupleSlice.actions;
export default coupleSlice.reducer;
