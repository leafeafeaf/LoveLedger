import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/axios";
import { CoupleUnlinkResponse, InviteSuccessResponse } from "../types/index";

// 초대 링크 데이터 확장 인터페이스
interface ExtendedInviteData {
  link: string;
  inviteCode?: string;
  createdAt?: string;
  expiresAt?: string;
  remainingHours?: number;
}

// 확장된 초대 링크 응답 인터페이스
interface ExtendedInviteResponse {
  status: string;
  message: string;
  data: ExtendedInviteData;
  timestamp: string;
  success?: boolean;
}

interface CoupleState {
  error: string | null;
  isUnlinking: boolean;
  unlinkSuccess: boolean;
  lastUnlinkTimestamp: string | null;
  inviteLink: string | null;
  inviteLinkMessage: string | null;
  inviteLinkCreatedAt: string | null;
  inviteLinkExpiresAt: string | null;
  inviteCode: string | null;
  remainingHours: number | null;
  isLinkGenerating: boolean;
}

const initialState: CoupleState = {
  error: null,
  isUnlinking: false,
  unlinkSuccess: false,
  lastUnlinkTimestamp: null,
  inviteLink: null,
  inviteLinkMessage: null,
  inviteLinkCreatedAt: null,
  inviteLinkExpiresAt: null,
  inviteCode: null,
  remainingHours: null,
  isLinkGenerating: false,
};

// 비동기 액션 생성자
export const unlinkCoupleAsync = createAsyncThunk(
  "couple/unlinkCouple",
  async (coupleId: string, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const accessToken = state.auth.userToken;

      const response = await axiosInstance.post<CoupleUnlinkResponse>(
        `/couple/unlink`,
        { coupleId },
        {
          headers: {
            Authorization: accessToken,
          },
        }
      );

      return response.data;
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
    startGenerateInviteLink: (state) => {
      state.isLinkGenerating = true;
      state.error = null;
    },
    setInviteLink: (state, action: PayloadAction<InviteSuccessResponse>) => {
      state.inviteLink = action.payload.data?.link || null;
      state.inviteLinkMessage = action.payload.message;
      state.inviteLinkCreatedAt = action.payload.timestamp;
      state.inviteLinkExpiresAt = null;
      state.isLinkGenerating = false;
      state.error = null;
    },
    // 확장된 초대 링크 정보를 저장하는 액션
    setExtendedInviteLink: (
      state,
      action: PayloadAction<ExtendedInviteResponse>
    ) => {
      state.inviteLink = action.payload.data?.link || null;
      state.inviteLinkMessage = action.payload.message;
      state.inviteLinkCreatedAt =
        action.payload.data?.createdAt || action.payload.timestamp;
      state.inviteLinkExpiresAt = action.payload.data?.expiresAt || null;
      state.inviteCode = action.payload.data?.inviteCode || null;
      state.remainingHours = action.payload.data?.remainingHours || null;
      state.isLinkGenerating = false;
      state.error = null;
    },
    clearInviteLink: (state) => {
      state.inviteLink = null;
      state.inviteLinkMessage = null;
      state.inviteLinkCreatedAt = null;
      state.inviteLinkExpiresAt = null;
      state.inviteCode = null;
      state.remainingHours = null;
    },
    generateInviteLinkFailure: (state, action: PayloadAction<string>) => {
      state.isLinkGenerating = false;
      state.error = action.payload;
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

export const {
  setError,
  clearError,
  resetUnlinkState,
  setInviteLink,
  setExtendedInviteLink,
  clearInviteLink,
  startGenerateInviteLink,
  generateInviteLinkFailure,
} = coupleSlice.actions;
export default coupleSlice.reducer;
