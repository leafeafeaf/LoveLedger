import { axiosInstance } from "./axios";
import { SignUpRequest, UpdateUserRequest } from "../types";

/**
 * 유저 기본 정보 입력 API (회원가입 후 추가 정보)
 * @param userData 유저 기본 정보
 * @returns API 응답
 */
export const updateUserInfo = async (userData: SignUpRequest) => {
  const { data } = await axiosInstance.put("/user", userData);
  return data;
};

/**
 * 유저 정보 수정 API
 * @param userData 수정할 유저 정보
 * @returns API 응답
 */
export const updateUserProfile = async (userData: UpdateUserRequest) => {
  const { data } = await axiosInstance.patch("/user", userData);
  return data;
};

/**
 * 유저 상세 정보 조회 API
 * @returns API 응답
 */
export const getUserDetail = async () => {
  const { data } = await axiosInstance.get("/user");

  return data;
};

/**
 * 로그아웃 API
 * @returns API 응답
 */
export const logout = async () => {
  const { data } = await axiosInstance.post("/user/logout");
  return data;
};
