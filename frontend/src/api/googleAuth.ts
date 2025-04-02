import { axiosInstance } from "./axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

// 딥링크 설정
const PREFIX = Linking.createURL("/");
const GOOGLE_REDIRECT_PATH = "oauth/google";

/**
 * 구글 소셜 로그인 URL을 가져오는 함수
 * @param redirectUri 리디렉션 URI (옵션)
 * @returns 구글 로그인 URL
 */
export const getGoogleAuthUrl = (redirectUri?: string) => {
  const finalRedirectUri = redirectUri || `${PREFIX}${GOOGLE_REDIRECT_PATH}`;
  return `${axiosInstance.defaults.baseURL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(finalRedirectUri)}`;
};

/**
 * 소셜 로그인 응답 타입
 */
export interface SocialLoginResponse {
  token: string;
  isNewUser: boolean;
  userInfo: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * 구글 로그인 처리 함수
 * @param onLoginStart 로그인 시작 시 콜백
 * @param onLoginEnd 로그인 종료 시 콜백 (성공/실패 모두 호출)
 * @returns 시스템 브라우저를 통한 로그인 처리 결과 Promise
 */
export const handleGoogleLogin = async (
  onLoginStart?: () => void,
  onLoginEnd?: (success: boolean) => void
): Promise<boolean> => {
  try {
    if (onLoginStart) {
      onLoginStart();
    }

    // 구글 인증 URL 가져오기
    const authUrl = getGoogleAuthUrl();
    console.log("[구글 인증 URL]", authUrl);

    // 시스템 브라우저로 URL 열기
    const supported = await Linking.canOpenURL(authUrl);
    if (!supported) {
      throw new Error("URL을 열 수 없습니다.");
    }

    await Linking.openURL(authUrl);

    // 결과는 딥링크를 통해 앱으로 돌아올 때 처리됨
    return true;
  } catch (error) {
    console.error("[구글 로그인 오류]", error);
    if (onLoginEnd) {
      onLoginEnd(false);
    }
    return false;
  }
};

/**
 * 딥링크 URL을 처리하는 함수
 * @param url 딥링크 URL
 * @returns 처리 결과를 담은 Promise
 */
export const processAuthRedirect = async (
  url: string
): Promise<SocialLoginResponse | null> => {
  try {
    if (!url || !url.includes(GOOGLE_REDIRECT_PATH)) {
      return null;
    }

    console.log("[인증 리디렉션 URL 처리]", url);

    // URL 파싱
    const { queryParams } = Linking.parse(url);

    // 코드 기반 인증
    if (queryParams?.code) {
      const code = queryParams.code as string;

      // 백엔드에 코드 전송
      const response = await axiosInstance.post("/auth/google/callback", {
        code,
        redirectUri: `${PREFIX}${GOOGLE_REDIRECT_PATH}`,
      });

      if (!response.data || !response.data.accessToken) {
        throw new Error("백엔드에서 유효한 응답을 받지 못했습니다.");
      }

      const { accessToken, user, isNewUser } = response.data;

      // 토큰 저장
      await AsyncStorage.setItem("token", accessToken);

      // 응답 객체 생성
      const result: SocialLoginResponse = {
        token: accessToken,
        isNewUser: isNewUser || false,
        userInfo: user,
      };

      return result;
    }

    // 토큰 직접 전달 방식
    else if (queryParams?.accessToken) {
      const accessToken = queryParams.accessToken as string;
      const isNewUser = queryParams.isNewUser === "true";

      // 토큰 저장
      await AsyncStorage.setItem("token", accessToken);

      // 토큰으로 사용자 정보 요청
      const userResponse = await axiosInstance.get("/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.data) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      // 응답 객체 생성
      const result: SocialLoginResponse = {
        token: accessToken,
        isNewUser: isNewUser,
        userInfo: userResponse.data,
      };

      return result;
    }

    return null;
  } catch (error) {
    console.error("[인증 URL 처리 오류]", error);
    return null;
  }
};

/**
 * 초기 URL을 확인하고 처리하는 함수
 * @returns 처리 결과를 담은 Promise
 */
export const checkInitialURL =
  async (): Promise<SocialLoginResponse | null> => {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        return await processAuthRedirect(url);
      }
      return null;
    } catch (error) {
      console.error("[초기 URL 확인 오류]", error);
      return null;
    }
  };
