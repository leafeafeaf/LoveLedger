import React, { useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useTokenIntegration } from "../hooks/useTokenIntegration";
import { theme } from "../utils/theme";

export const TestQueryButton = () => {
  const { fetchTokenWithQuery, fetchTokenWithRedux, token, isLoading, error } =
    useTokenIntegration();
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const handleQueryTest = async () => {
    try {
      // 테스트 사용자 ID
      const userId = 1;
      console.log(`[React Query 테스트] GET /test/token/${userId}`);

      // React Query를 사용하여 토큰 요청
      const result = await fetchTokenWithQuery(userId);

      // 결과 로깅
      console.log("[React Query 응답]", JSON.stringify(result.data, null, 2));

      // 상태 업데이트
      setQueryResult(JSON.stringify(result.data, null, 2));
    } catch (err: any) {
      console.error("[React Query 오류]", err);
      setQueryResult(`오류: ${err.message}`);
    }
  };

  const handleReduxTest = async () => {
    try {
      // 테스트 사용자 ID
      const userId = 1;
      console.log(`[Redux 테스트] GET /test/token/${userId}`);

      // Redux를 사용하여 토큰 요청
      await fetchTokenWithRedux(userId);

      // 결과 로깅 (Redux 스토어 상태는 컴포넌트에 자동으로 반영됨)
      console.log("[Redux 토큰 상태]", token);

      // 상태 업데이트
      setQueryResult(`Redux 토큰: ${token}`);
    } catch (err: any) {
      console.error("[Redux 테스트 오류]", err);
      setQueryResult(`오류: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={handleQueryTest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>React Query 테스트</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={handleReduxTest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Redux 테스트</Text>
        )}
      </Pressable>

      {queryResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText} numberOfLines={4}>
            {queryResult}
          </Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: "100%",
  },
  resultText: {
    fontSize: 12,
    color: "#333",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});
