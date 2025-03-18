import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // URL에서 토큰 가져오기 (프래그먼트 방식 #accessToken=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("accessToken=")) {
      const accessToken = hash.split("accessToken=")[1];

      console.log('토큰 감지:', accessToken.substring(0, 10) + '...');
      localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);

      // URL 정리 (프래그먼트 제거)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 구글 로그인
  const onGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  // API 요청 공통 함수
  const callApi = (url) => {
    setLoading(true);
    setError(null);

    const currentToken = localStorage.getItem('accessToken');
    console.log('API 요청 시 사용할 토큰:', currentToken);

    // 토큰이 없으면 에러 표시
    if (!currentToken) {
      setError("액세스 토큰이 없습니다. 로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const headers = {
      'Authorization': currentToken, // Bearer 프리픽스 제거
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('요청 헤더:', headers);

    axios({
      method: 'get',
      url: url,
      headers: headers,
      withCredentials: true
    })
    .then((res) => {
      console.log('응답 성공:', res);
      setResponse(res.data);
      setLoading(false);
    })
    .catch((error) => {
      console.error("요청 오류:", error);
      console.error("에러 상태:", error.response ? error.response.status : '응답 없음');

      if (error.response && error.response.status === 401) {
        localStorage.removeItem('accessToken');
        setToken(null);
        setError("인증 필요! 다시 로그인해주세요.");
      } else {
        setError((error.response && error.response.data) ?
            JSON.stringify(error.response.data) :
            (error.message || "오류 발생"));
      }

      setLoading(false);
    });
  };

  // 토큰 직접 설정 기능 (테스트용)
  const setCustomToken = () => {
    const customToken = prompt("테스트용 액세스 토큰을 입력하세요:");
    if (customToken) {
      localStorage.setItem('accessToken', customToken);
      setToken(customToken);
      console.log('토큰 직접 설정됨:', customToken.substring(0, 10) + '...');
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setResponse(null);
    setError(null);
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>OAuth2 테스트</h1>

          {token ? (
              <div className="auth-status">
                <p>로그인됨 ✅</p>
                <button onClick={logout}>로그아웃</button>
              </div>
          ) : (
              <div>
                <button onClick={onGoogleLogin}>Google 로그인</button>
                <button onClick={setCustomToken} style={{marginLeft: '10px'}}>토큰 직접 입력</button>
              </div>
          )}

          <div className="button-group">
            <button onClick={() => callApi("http://localhost:8080/my")} disabled={loading}>
              My API 호출
            </button>
            <button onClick={() => callApi("http://localhost:8080/")} disabled={loading}>
              루트 API 호출
            </button>
          </div>

          {token && (
              <div className="token-info">
                <strong>토큰:</strong> {token.substring(0, 15)}...
                <button onClick={() => {
                  console.log('현재 토큰:', token);
                  alert('토큰이 콘솔에 출력되었습니다.');
                }} style={{marginLeft: '10px', fontSize: '12px'}}>
                  토큰 확인
                </button>
              </div>
          )}

          <div className="response-container">
            {loading && <p>로딩 중...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {response && (
                <pre>
              {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
            </pre>
            )}
          </div>
        </header>
      </div>
  );
}

export default App;
