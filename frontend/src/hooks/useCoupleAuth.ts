import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";
import { UserDetailResponse } from "../types";

export const useCoupleAuth = () => {
  const { data: user, isLoading } = useQuery<UserDetailResponse>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/user");
      return data;
    },
  });

  return {
    user,
    isLoading,
  };
};
