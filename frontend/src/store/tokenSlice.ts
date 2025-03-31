import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchToken, TokenResponse } from "../api/tokenService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 상태 타입 정의
interface TokenState {
  accessToken: string | null;
  expiresIn: number | null;
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: TokenState = {
  accessToken: null,
  expiresIn: null,
  isLoading: false,
  error: null,
};

// 비동기 액션 생성자
export const fetchUserToken = createAsyncThunk(
  "token/fetchUserToken",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetchToken(userId);
      if (response.success) {
        // 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem("token", response.data.accessToken);

        // 토큰 만료 시간 저장
        const expiresAt = Date.now() + response.data.expiresIn;
        await AsyncStorage.setItem("tokenExpiresAt", expiresAt.toString());

        return response.data;
      } else {
        return rejectWithValue("토큰 요청이 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("알 수 없는 오류가 발생했습니다.");
    }
  }
);

// 토큰 슬라이스
const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{ accessToken: string; expiresIn: number }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresIn = action.payload.expiresIn;
      state.error = null;
    },
    clearToken: (state) => {
      state.accessToken = null;
      state.expiresIn = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.expiresIn = action.payload.expiresIn;
      })
      .addCase(fetchUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 내보내기
export const { setToken, clearToken, setError, clearError } =
  tokenSlice.actions;

// 리듀서 내보내기
export default tokenSlice.reducer;
