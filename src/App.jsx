
import "./index.css"; 

export default function App() {
  return (
    // React에서는 <div> 같은 하나의 태그로 감싸야 합니다. (Fragment <></> 사용)
    <>
      <header>
        <h1>📊 실시간 모니터링 대시보드</h1>
        <nav>
          {/* ⬇️ [수정 2] 링크 경로 수정 (pages/ 폴더 경로 추가) */}
          <a href="/pages/live_view.html">라이브 뷰</a>
        </nav>
      </header>

      <main>
        {/* 시스템 상태 요약 */}
        <section className="card"> {/* HTML의 class는 React에서 className이 됩니다. */}
          <h2>🛠 시스템 상태</h2>
          <ul className="status-list">
            <li>생산 라인: <strong>정상 가동 중</strong></li>
            <li>이상 감지: <strong>없음</strong></li>
            <li>최근 업데이트: 2025-10-15 13:30</li>
          </ul>
        </section>

        {/* AI 판별 요약 */}
        <section className="card">
          <h2>🤖 최근 AI 판별 결과</h2>
          <ul className="ai-list">
            <li>최근 1시간: <strong>정상 52건</strong>, <strong>불량 3건</strong></li>
            <li>불량률: <strong>5.45%</strong></li>
          </ul>
        </section>

        {/* 주석은 이렇게 {/**/} 처리합니다.
          실시간 처리량 차트 자리
          <section className="card">
            <h2>📈 실시간 처리량 차트</h2>
            <div className="chart-box">
              [ 실시간 차트 영역 ]
            </div>
          </section>
        */

        {/* 주요 기능 링크 */}
        <section className="card">
          <h2>🔗 주요 기능 바로가기</h2>
          <div className="link-list">
            {/* ⬇️ [수정 2] 링크 경로 수정 (pages/ 폴더 경로 추가) */}
            <a href="/pages/live_view.html">📺 실시간 라이브 뷰</a>
          </div>
        </section>
      </main>
    </>
  );
}