import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { loginSuccess, loginFailure, loginStart } from "../store/authSlice";
import {
  checkInitialURL,
  handleGoogleLogin as startGoogleLogin,
  processAuthRedirect,
} from "../api/googleAuth";

// 구글 OAuth 설정
const getGoogleClientId = () => {
  const config = Constants.expoConfig?.extra;
  if (!config) {
    throw new Error("Expo 설정을 찾을 수 없습니다.");
  }

  if (Platform.OS === "ios") {
    return config.GOOGLE_IOS_CLIENT_ID;
  } else if (Platform.OS === "android") {
    return config.GOOGLE_ANDROID_CLIENT_ID;
  } else {
    return config.GOOGLE_CLIENT_ID;
  }
};

// 딥링크 설정
const PREFIX = Linking.createURL("/");
const REDIRECT_PATH = "oauth/google";

export const useGoogleAuthApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(true);
  const dispatch = useDispatch();

  // 앱이 URL을 통해 열렸을 때 초기 URL 처리
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const result = await checkInitialURL();
        if (result) {
          // 토큰과 사용자 정보가 있으면 로그인 성공 처리
          dispatch(
            loginSuccess({
              token: result.token,
              userInfo: result.userInfo,
            })
          );

          // 신규 사용자인 경우 처리
          if (result.isNewUser) {
            setIsRegistered(false);
          }
        }
      } catch (err) {
        console.error("[초기 URL 처리 에러]", err);
      }
    };

    handleInitialURL();
  }, [dispatch]);

  // 앱이 실행 중일 때 URL 변경 처리를 위한 리스너
  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      try {
        setIsLoading(true);

        const result = await processAuthRedirect(url);
        if (result) {
          // 토큰과 사용자 정보가 있으면 로그인 성공 처리
          dispatch(
            loginSuccess({
              token: result.token,
              userInfo: result.userInfo,
            })
          );

          // 신규 사용자인 경우 처리
          if (result.isNewUser) {
            setIsRegistered(false);
          }
        }
      } catch (err: any) {
        console.error("[URL 처리 에러]", err);
        dispatch(
          loginFailure(err.message || "로그인 처리 중 오류가 발생했습니다.")
        );
        setError(err.message || "로그인 처리 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      dispatch(loginStart());

      console.log("[구글 로그인 시작]");
      await startGoogleLogin(
        () => console.log("[로그인 프로세스 시작]"),
        (success) => {
          if (!success) {
            setIsLoading(false);
            setError("로그인 시도 중 오류가 발생했습니다.");
            dispatch(loginFailure("로그인 시도 중 오류가 발생했습니다."));
          }
        }
      );

      // 로그인 결과는 딥링크 리스너에서 처리되므로 여기서는 아무것도 하지 않음
    } catch (err: any) {
      console.error("[구글 로그인 에러]", err);
      setError(err.message || "구글 로그인 중 오류가 발생했습니다.");
      dispatch(
        loginFailure(err.message || "구글 로그인 중 오류가 발생했습니다.")
      );
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isRegistered,
    handleGoogleLogin,
  };
};
