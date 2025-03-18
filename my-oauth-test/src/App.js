import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }

  const testApi = () => {
    console.log("API 요청 시작...");
    setLoading(true);
    setError(null);

    axios
    .get("http://localhost:8080/my", {
      withCredentials: true,
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    })
    .then((res) => {
      console.log("응답 받음:", res);
      console.log("응답 데이터:", res.data);
      console.log("응답 타입:", typeof res.data);

      setResponse(res.data);
      setLoading(false);

      // 1초 후 알림창 표시 시도 (타이밍 문제 해결 가능)
      setTimeout(() => {
        try {
          const message = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
          alert(`API 응답: ${message}`);
        } catch (e) {
          console.error("알림창 표시 오류:", e);
        }
      }, 1000);
    })
    .catch((error) => {
      console.error("오류 발생:", error);
      setError(error.message || "알 수 없는 오류");
      setLoading(false);

      setTimeout(() => {
        alert(`오류 발생: ${error.message}`);
      }, 1000);
    });
  }

  // 다른 경로 테스트용
  const testOtherApi = () => {
    console.log("다른 API 요청 시작...");
    setLoading(true);

    axios
    .get("http://localhost:8080/", { withCredentials: true })
    .then((res) => {
      console.log("루트 API 응답:", res.data);
      setResponse("루트 API 응답: " + JSON.stringify(res.data));
      setLoading(false);
      alert("루트 API 응답: " + JSON.stringify(res.data));
    })
    .catch((error) => {
      console.error("루트 API 오류:", error);
      setError("루트 API 오류: " + error.message);
      setLoading(false);
    });
  }

  return (
      <div className="App">
        <header className="App-header">
          <h1>OAuth2 & JWT 테스트</h1>
          <button onClick={onGoogleLogin} className="login-button">google 로그인</button>

          <div className="button-group">
            <button onClick={testApi} disabled={loading}>
              {loading ? '요청 중...' : 'My API 테스트'}
            </button>
            <button onClick={testOtherApi} disabled={loading}>
              루트 API 테스트
            </button>
          </div>

          <div className="response-container">
            <h3>API 응답 결과:</h3>
            {loading && <p className="loading">로딩 중...</p>}
            {error && <p className="error">오류: {error}</p>}
            {response && (
                <div className="response-data">
                  <p>응답 타입: {typeof response}</p>
                  <pre>{typeof response === 'string' ? response : JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
          </div>
        </header>
      </div>
  );
}

export default App;