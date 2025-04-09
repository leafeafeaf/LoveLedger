import { useState, useEffect, useRef } from "react";
import {
  handleGoogleLogin,
  extractTokenFromHash,
  extractTokenFromUrl,
  clearLoginTimer,
} from "../api/googleAuth";
import { useAppDispatch } from "./reduxHooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "../store/authSlice";
import { Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 구글 소셜 로그인을 위한 커스텀 훅
 */

type ParsedSocialLogin = {
  isNewUser: boolean;
  token: string;
};

export const useGoogleLogin = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttemptTimestamp, setLoginAttemptTimestamp] = useState<
    number | null
  >(null);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로그인 시도 취소 함수
  const cancelLoginAttempt = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearLoginTimer();
    setIsLoading(false);
    dispatch(clearError());
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      cancelLoginAttempt();
    };
  }, []);

  // 로그인 성공 처리 함수
  const handleLoginSuccess = (response: ParsedSocialLogin) => {
    setIsLoading(false);
    setError(null);
    setIsNewUser(response.isNewUser);
    dispatch(
      loginSuccess({
        token: response.token,
        isNewUser : response.isNewUser
      })
    );
  };

  // URL 처리 함수
  const handleUrl = async (url: string) => {
    if (url.includes("loveledger://oauth2/google")) {
      const tokenMatch = url.match(/accessToken=([^&]+)/);
      const isRegisteredMatch = url.match(/isRegistered=([^&]+)/);

      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        const isRegistered = isRegisteredMatch
          ? isRegisteredMatch[1] === "true"
          : false;

        handleLoginSuccess({
          token,
          isNewUser: !isRegistered,
        });
      }
    }
  };

  // 웹 환경에서 리디렉션 후 해시에서 토큰 추출
  useEffect(() => {
    if (Platform.OS === "web") {
      const checkToken = async () => {
        const response = await extractTokenFromHash();
        if (response) {
          handleLoginSuccess(response);
        }
      };

      checkToken();
    }
  }, [dispatch]);

  // 모바일 환경에서 딥링크 처리 설정
  useEffect(() => {
    if (Platform.OS !== "web") {
      let initialHandled = false;
  
      const handleDeepLink = async ({ url }: { url: string }) => {
        // 이미 처리했으면 무시
        if (initialHandled) return;
  
        if (url.includes("accessToken")) {
          const response = await extractTokenFromUrl(url);
          if (response) {
            handleLoginSuccess(response);
            initialHandled = true;
          }
        }
      };
      const subscription = Linking.addEventListener("url", handleDeepLink);
  
      return () => {
        subscription.remove();
      };
    }
  }, []);

  // 구글 로그인 처리 함수
  const googleLogin = async () => {
    // 이미 로그인 시도 중이라면 이전 요청 취소
    if (isLoading) {
      cancelLoginAttempt();
    }

    setIsLoading(true);
    setError(null);
    setIsNewUser(null);
    dispatch(loginStart());
    setLoginAttemptTimestamp(Date.now());

    try {
      await handleGoogleLogin(
        (response, err) => {
          if (err) {
            setError(err.message || "소셜 로그인에 실패했습니다.");
            dispatch(
              loginFailure(err.message || "소셜 로그인에 실패했습니다.")
            );
            setIsLoading(false);
          }
        },
        () => {
          // 타임아웃 처리
          setError("로그인 시간이 초과되었습니다. 다시 시도해주세요.");
          dispatch(
            loginFailure("로그인 시간이 초과되었습니다. 다시 시도해주세요.")
          );
          setIsLoading(false);
        },
        30000 // 30초 타임아웃
      );
    } catch (err: any) {
      setError(err.message || "소셜 로그인에 실패했습니다.");
      dispatch(loginFailure(err.message || "소셜 로그인에 실패했습니다."));
      setIsLoading(false);
    }
  };

  return {
    googleLogin,
    isLoading,
    error,
    isNewUser,
    cancelLoginAttempt,
    loginAttemptTimestamp,
  };
};
