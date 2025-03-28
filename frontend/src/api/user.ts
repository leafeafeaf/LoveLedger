import { axiosInstance } from "./axios";
import { SignUpRequest } from "../types";

/**
 * 유저 기본 정보 입력 API (회원가입 후 추가 정보)
 * @param userData 유저 기본 정보
 * @returns API 응답
 */
export const updateUserInfo = async (userData: SignUpRequest) => {
  const { data } = await axiosInstance.put("/user", userData);
  return data;
};
