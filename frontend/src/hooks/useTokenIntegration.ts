import { useTokenApi } from "./useTokenApi";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { fetchUserToken, setToken, clearToken } from "../store/tokenSlice";
import { loginSuccess } from "../store/authSlice";
import { useCallback, useEffect } from "react";

/**
 * Redux와 React Query를 함께 사용하여 토큰을 관리하는 통합 훅
 * 상황에 따라 React Query나 Redux 중 하나를 선택하거나, 둘 다 사용할 수 있습니다.
 */
export const useTokenIntegration = () => {
  const dispatch = useAppDispatch();
  const tokenState = useAppSelector((state) => state.token);

  // React Query 훅 사용
  const {
    tokenData,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    getTokenForUser,
  } = useTokenApi();

  // 토큰 데이터가 변경되면 Redux 상태도 업데이트
  useEffect(() => {
    if (tokenData?.success && tokenData.data) {
      // 토큰 상태 업데이트
      dispatch(
        setToken({
          accessToken: tokenData.data.accessToken,
          expiresIn: tokenData.data.expiresIn,
        })
      );
      
      // 인증 상태 업데이트 - 로그인 성공으로 처리
      dispatch(
        loginSuccess({
          token: tokenData.data.accessToken
        })
      );
    }
  }, [tokenData, dispatch]);

  // React Query를 사용하여 토큰 가져오기
  const fetchTokenWithQuery = useCallback(
    async (userId: number) => {
      const result = await getTokenForUser(userId);
      if (result.data?.success && result.data?.data) {
        // 인증 상태 업데이트 - 로그인 성공으로 처리
        dispatch(
          loginSuccess({
            token: result.data.data.accessToken
          })
        );
      }
      return result;
    },
    [getTokenForUser, dispatch]
  );

  // Redux를 사용하여 토큰 가져오기
  const fetchTokenWithRedux = useCallback(
    async (userId: number) => {
      const result = await dispatch(fetchUserToken(userId));
      if (result.meta.requestStatus === 'fulfilled') {
        // 인증 상태 업데이트 - 로그인 성공으로 처리
        const payload = result.payload as { accessToken: string, expiresIn: number };
        dispatch(
          loginSuccess({
            token: payload.accessToken
          })
        );
      }
      return result;
    },
    [dispatch]
  );

  // 토큰 지우기
  const clearTokenData = useCallback(() => {
    dispatch(clearToken());
  }, [dispatch]);

  return {
    // 통합된 상태 정보
    token: tokenState.accessToken || tokenData?.data?.accessToken || null,
    expiresIn: tokenState.expiresIn || tokenData?.data?.expiresIn || null,
    isLoading: tokenState.isLoading || isQueryLoading,
    error: tokenState.error || (isQueryError ? queryError?.message : null),

    // 사용 가능한 액션
    fetchTokenWithQuery, // React Query 사용
    fetchTokenWithRedux, // Redux 사용
    clearTokenData, // 토큰 데이터 지우기
  };
};
