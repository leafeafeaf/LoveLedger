import { axiosInstance } from "./axios";
import { Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 기존 API 함수들...

/**
 * 구글 소셜 로그인 URL을 가져오는 함수
 * @returns 구글 로그인 URL
 */
export const getGoogleAuthUrl = () => {
  return `${axiosInstance.defaults.baseURL}/oauth2/authorization/google`;
};

// 활성 타이머를 저장할 변수
let activeLoginTimer: NodeJS.Timeout | null = null;

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
 * 소셜 로그인을 처리하는 함수
 * @param onLogin 로그인 성공/실패 후 콜백
 * @param onTimeout 타임아웃 발생 시 콜백
 * @param timeoutMs 타임아웃 시간 (밀리초)
 */
export const handleGoogleLogin = async (
  onLogin: (response: SocialLoginResponse | null, error?: any) => void,
  onTimeout?: () => void,
  timeoutMs: number = 30000
) => {
  try {
    // 이전 타이머가 있으면 취소
    if (activeLoginTimer) {
      clearTimeout(activeLoginTimer);
      activeLoginTimer = null;
    }

    // 타임아웃 타이머 설정
    activeLoginTimer = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        onLogin(null, new Error("로그인 시간이 초과되었습니다."));
      }
      activeLoginTimer = null;
    }, timeoutMs);

    // 플랫폼 확인
    if (Platform.OS === "web") {
      // 웹 환경에서는 직접 리디렉션
      window.location.href = getGoogleAuthUrl();
      return;
    } else {
      // 모바일 환경에서는 외부 브라우저 열기
      const supported = await Linking.canOpenURL(getGoogleAuthUrl());

      if (supported) {
        // URL 이벤트 리스너 추가
        const urlListener = Linking.addEventListener('url', ({ url }) => {
          // URL에서 토큰 추출 시도
          if (url.includes('loveledger://')) {
            urlListener.remove(); // 리스너 제거
            clearLoginTimer(); // 타이머 제거
            extractTokenAndCheckUser(url).then(response => {
              if (response) {
                onLogin(response);
              } else {
                onLogin(null, new Error('토큰 추출 실패'));
              }
            });
          }
        });

        // 브라우저 열기
        await Linking.openURL(getGoogleAuthUrl());
      } else {
        clearLoginTimer();
        onLogin(null, new Error("URL을 열 수 없습니다."));
      }
    }
  } catch (error) {
    clearLoginTimer();
    console.error("소셜 로그인 오류:", error);
    onLogin(null, error);
  }
};

/**
 * 활성 로그인 타이머를 취소하는 함수
 */
export const clearLoginTimer = () => {
  if (activeLoginTimer) {
    clearTimeout(activeLoginTimer);
    activeLoginTimer = null;
  }
};

/**
 * URL 해시에서 토큰을 추출하고 사용자 정보 확인
 * @param url 리디렉션 URL 또는 해시
 * @returns 토큰과 신규 사용자 여부 포함한 응답
 */
export const extractTokenAndCheckUser = async (
  url: string
): Promise<SocialLoginResponse | null> => {
  let token = null;

  // URL 해시에서 토큰 추출
  if (url.includes("#access_token=")) {
    token = url.split("#access_token=")[1].split("&")[0];
  } else if (Platform.OS === "web" && window.location.hash) {
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    token = params.get("access_token");

    // URL에서 해시 제거 (히스토리 클리어)
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.search
    );
  }

  if (!token) return null;

  // 토큰 저장
  await AsyncStorage.setItem("token", token);

  // 타이머 제거
  clearLoginTimer();

  try {
    // 사용자 정보 확인 API 호출 (여기서는 실제 구현 대신 시뮬레이션)
    // 실제로는 백엔드에 사용자 정보를 요청해야 함

    // 토큰이 "first-time"을 포함하면 신규 사용자로 가정 (테스트용)
    const isNewUser = token.includes("first-time");

    // 임시 사용자 정보
    const userInfo = {
      id: "1",
      name: "구글 사용자",
      email: "user@google.com",
    };

    // 응답 생성
    const response: SocialLoginResponse = {
      token,
      isNewUser,
      userInfo,
    };

    return response;
  } catch (error) {
    console.error("사용자 정보 확인 중 오류:", error);
    return null;
  }
};

/**
 * URL 해시에서 토큰을 추출하는 함수 (웹 환경)
 */
export const extractTokenFromHash = async () => {
  try {
    // 토큰 및 사용자 정보 추출
    const response = await extractTokenAndCheckUser(
      Platform.OS === "web" ? window.location.href : ""
    );
    return response;
  } catch (error) {
    console.error("토큰 추출 오류:", error);
    return null;
  }
};

/**
 * URL에서 토큰을 추출하는 함수 (모바일 환경)
 * @param url 딥링크 URL
 */
export const extractTokenFromUrl = async (url: string) => {
  try {
    // 토큰 및 사용자 정보 추출
    const response = await extractTokenAndCheckUser(url);
    return response;
  } catch (error) {
    console.error("토큰 추출 오류:", error);
    return null;
  }
};
