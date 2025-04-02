import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { InviteResponse, InviteErrorResponse } from "../types/index";

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
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log("[fetchInviteLink] 액션 시작");
      const state = getState() as any;
      const accessToken = state.auth.userToken;
      console.log("[fetchInviteLink] 현재 상태:", {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
      });

      if (!accessToken) {
        console.error("[fetchInviteLink] 토큰 없음");
        throw new Error("인증 토큰이 없습니다.");
      }

      console.log("[fetchInviteLink] API 요청 시작:", `${API_BASE_URL}/invite`);
      const response = await axios.get(`${API_BASE_URL}/invite`, {
        headers: {
          "Content-Type": "application/json; charset=utf8",
          Authorization: accessToken,
        },
      });
      console.log("[fetchInviteLink] API 응답 성공:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[fetchInviteLink] API 에러:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
      console.log("[clearInvite] 초대 링크 초기화");
      state.link = null;
      state.existingLink = null;
      state.createdAt = null;
      state.expiresAt = null;
      state.action = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      console.log("[clearError] 에러 초기화");
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInviteLink.pending, (state) => {
        console.log("[fetchInviteLink.pending] 로딩 시작");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInviteLink.fulfilled, (state, action) => {
        console.log(
          "[fetchInviteLink.fulfilled] 전체 응답:",
          JSON.stringify(action.payload, null, 2)
        );
        state.isLoading = false;

        // API 응답 구조 확인
        if (!action.payload) {
          console.error("[fetchInviteLink.fulfilled] payload가 없음");
          state.error = "응답 데이터가 없습니다.";
          return;
        }

        // API 응답 구조에 따라 데이터 접근 방식 수정
        const responseData = action.payload;
        console.log(
          "[fetchInviteLink.fulfilled] 처리된 응답 데이터:",
          JSON.stringify(responseData, null, 2)
        );

        if (!responseData.data?.data?.link) {
          console.error(
            "[fetchInviteLink.fulfilled] 유효하지 않은 응답 데이터 구조:",
            responseData
          );
          state.error = "유효하지 않은 응답 데이터입니다.";
          return;
        }

        const fullLink = responseData.data.data.link;
        console.log("[fetchInviteLink.fulfilled] 전체 링크:", fullLink);

        // 링크에서 초대 코드 추출
        const inviteCode = fullLink.split("/").pop()?.split("#")[0] || null;
        console.log(
          "[fetchInviteLink.fulfilled] 추출된 초대 코드:",
          inviteCode
        );

        if (!inviteCode) {
          console.error("[fetchInviteLink.fulfilled] 초대 코드 추출 실패");
          state.error = "초대 코드를 추출할 수 없습니다.";
          return;
        }

        state.link = inviteCode;
        state.error = null;
        console.log("[fetchInviteLink.fulfilled] 상태 업데이트 완료:", {
          link: state.link,
          error: state.error,
        });
      })
      .addCase(fetchInviteLink.rejected, (state, action) => {
        console.log("[fetchInviteLink.rejected] 실패:", action.payload);
        state.isLoading = false;
        const error = action.payload as InviteErrorResponse;

        if (error.status === "409") {
          console.log("[fetchInviteLink.rejected] 중복 링크 에러 처리");
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
