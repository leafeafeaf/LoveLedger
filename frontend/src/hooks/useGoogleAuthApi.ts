import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "../store/slices/userSlice";
import { axiosInstance } from "../api/axios";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// 디바이스별 구글 OAuth 설정
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
    return config.GOOGLE_CLIENT_ID; // 웹 또는 기타 플랫폼
  }
};

const GOOGLE_CLIENT_ID = getGoogleClientId();

if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "Google Client ID가 설정되지 않았습니다. .env 파일에서 GOOGLE_CLIENT_ID를 확인해주세요."
  );
}

export const useGoogleAuthApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const dispatch = useDispatch();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "loveledger",
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("[구글 로그인 성공]", authentication?.accessToken);

      // 서버에 인증 코드 전송
      const handleServerAuth = async () => {
        try {
          console.log("[서버로 인증 코드 전송 시작]");
          const response = await axiosInstance.post("/auth/google", {
            code: authentication?.accessToken,
            redirectUri: AuthSession.makeRedirectUri({
              scheme: "loveledger",
            }),
          });

          console.log("[서버 응답]", response.data);

          const { accessToken, user } = response.data;

          // 토큰 저장
          await AsyncStorage.setItem("token", accessToken);
          console.log("[토큰 저장 완료]");

          // Redux 상태 업데이트
          dispatch(setUser(user));
          console.log("[Redux 상태 업데이트 완료]");
        } catch (error: any) {
          console.error("[서버 인증 에러]", error);
          setError(error.message || "서버 인증 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      handleServerAuth();
    } else if (response?.type === "error") {
      console.error("[구글 로그인 에러]", response.error);
      setError("구글 로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }, [response, dispatch]);

  const handleGoogleLogin = async () => {
    console.log("[구글 로그인 시작]");
    setIsLoading(true);
    setError(null);

    try {
      await promptAsync();
    } catch (error: any) {
      console.error("[구글 로그인 에러]", error);
      setError(error.message || "구글 로그인 중 오류가 발생했습니다.");
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
