import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateInviteLink } from "../api/invite";
import { InviteResponse, InviteErrorResponse } from "../types/invite";

// 상태 타입 정의
interface InviteState {
  link: string | null;
  existingLink: string | null;
  createdAt: string | null;
  expiresAt: string | null;
  action: string | null;
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: InviteState = {
  link: null,
  existingLink: null,
  createdAt: null,
  expiresAt: null,
  action: null,
  isLoading: false,
  error: null,
};

// 비동기 액션 생성자
export const fetchInviteLink = createAsyncThunk(
  "invite/fetchInviteLink",
  async (_, { rejectWithValue }) => {
    try {
      const response = await generateInviteLink();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// invite 슬라이스
const inviteSlice = createSlice({
  name: "invite",
  initialState,
  reducers: {
    clearInvite: (state) => {
      state.link = null;
      state.existingLink = null;
      state.createdAt = null;
      state.expiresAt = null;
      state.action = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInviteLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInviteLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.link = action.payload.data.link;
        state.error = null;
      })
      .addCase(fetchInviteLink.rejected, (state, action) => {
        state.isLoading = false;
        const error = action.payload as InviteErrorResponse;

        if (error.status === "409") {
          // 중복 링크 에러 처리
          state.existingLink = error.data?.existingLink || null;
          state.createdAt = error.data?.createdAt || null;
          state.expiresAt = error.data?.expiresAt || null;
          state.action = error.data?.action || null;
        }

        state.error = error.message;
      });
  },
});

// 액션 내보내기
export const { clearInvite, clearError } = inviteSlice.actions;

// 리듀서 내보내기
export default inviteSlice.reducer;
