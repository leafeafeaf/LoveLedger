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
      action: PayloadAction<{ token: string; userInfo: UserInfo }>
    ) => {
      state.isAuthenticated = true;
      state.userToken = action.payload.token;
      state.userInfo = action.payload.userInfo;
      state.isLoading = false;
      state.error = null;
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
    const token = await AsyncStorage.getItem("token");

    if (token) {
      dispatch(
        restoreLoginState({
          token,
          userInfo: {
            id: "1",
            name: "자동 로그인 사용자",
            email: "user@example.com",
          },
        })
      );
    } else {
      dispatch(setAutoLoginChecked(true));
    }
  } catch (error) {
    console.error("자동 로그인 체크 중 오류 발생:", error);
    dispatch(setAutoLoginChecked(true));
  }
};
