import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const baseURL =
  process.env.REACT_APP_API_URL || "http://j12b205.p.ssafy.io/api";

export const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json; charset=utf8",
  },
});

// 인터셉터 설정
axiosInstance.interceptors.request.use(
  async (config) => {
    // 토큰이 필요한 경우 여기서 처리
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 자동 로그아웃을 위한 이벤트 생성
export const AuthEvents = {
  onTokenExpired: null as ((error: any) => void) | null,
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 등의 처리
      await AsyncStorage.removeItem("token");

      // Web 환경인 경우 직접 리다이렉트
      if (Platform.OS === "web") {
        window.location.href = "/login";
      }
      // 모바일 환경에서는 이벤트 콜백을 통해 네비게이션을 처리
      else if (AuthEvents.onTokenExpired) {
        AuthEvents.onTokenExpired(error);
      }
    }
    return Promise.reject(error);
  }
);
