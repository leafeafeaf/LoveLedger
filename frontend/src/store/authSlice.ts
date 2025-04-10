import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CoupleInfo } from "../types";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  gender?: boolean;
  birthDay?: string;
  isMarried?: boolean;
  picture?: string | null;
  coupleInfo?: CoupleInfo | null;
  marryDate?: string | null;
  marriageDuration?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  autoLoginChecked: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userToken: null,
  userInfo: null,
  isLoading: false,
  error: null,
  autoLoginChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ 
        token: string; 
        // userInfo: UserInfo;
        isNewUser?: boolean;  // isNewUser 추가
      }>
    ) => {
      state.isAuthenticated = true;
      state.userToken = action.payload.token;
      // state.userInfo = action.payload.userInfo;
      state.isLoading = false;
      state.error = null;
      // AsyncStorage에 토큰 저장
      AsyncStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userToken = null;
      state.userInfo = null;
      state.error = null;
      // AsyncStorage에서 토큰 제거
      AsyncStorage.removeItem('token');
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setAutoLoginChecked: (state, action: PayloadAction<boolean>) => {
      state.autoLoginChecked = action.payload;
    },
    restoreLoginState: (
      state,
      action: PayloadAction<{ token: string; userInfo: UserInfo }>
    ) => {
      state.isAuthenticated = true;
      state.userToken = action.payload.token;
      state.userInfo = action.payload.userInfo;
      state.autoLoginChecked = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserInfo,
  clearError,
  setAutoLoginChecked,
  restoreLoginState,
} = authSlice.actions;
export default authSlice.reducer;

export const logoutAndClearStorage = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem("token");
    dispatch(logout());
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
  }
};

export const checkAuthStatus = () => async (dispatch: any) => {
  try {
    console.log("자동 로그인 체크 시작");
    const token = await AsyncStorage.getItem("token");
    console.log("저장된 토큰:", token ? "토큰 있음" : "토큰 없음");

    if (token) {
      console.log("토큰 존재, 자동 로그인 처리");
      // 토큰이 있으면 로그인 상태 복원
      dispatch(
        restoreLoginState({
          token,
          userInfo: {
            id: "1", // 실제 환경에서는 토큰에서 디코딩하거나 API 호출하여 사용자 정보 가져오기
            name: "자동 로그인 사용자",
            email: "user@example.com",
          },
        })
      );
    } else {
      console.log("토큰 없음, 로그인 필요");
      dispatch(setAutoLoginChecked(true));
    }
  } catch (error) {
    console.error("자동 로그인 체크 중 오류 발생:", error);
    dispatch(setAutoLoginChecked(true));
  }
};
