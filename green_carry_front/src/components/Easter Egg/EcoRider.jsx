import React, { useState, useEffect, useRef } from "react";
import "./EcoRider.css";

const EcoRider = () => {
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const riderRef = useRef(null);
  const obstacleRef = useRef(null);
  const gameLoopRef = useRef(null);

  // 1. 'rider' 타이핑 감지 로직
  useEffect(() => {
    let keys = [];
    const secretWord = "rider";

    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        setIsActive(true);
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. 점프 실행 함수
  const jump = () => {
    if (!isJumping && !isGameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500); // 점프 체공 시간
    }
  };

  //  3. 스페이스바 감지 로직 (새로 추가됨!)
  useEffect(() => {
    const handleSpacebar = (e) => {
      // 게임이 켜져있고, 누른 키가 스페이스바(Space)일 때
      if (isActive && e.code === "Space") {
        e.preventDefault(); // 스페이스바 누를 때 화면이 스크롤되는 기본 기능 차단
        jump();
      }
    };

    window.addEventListener("keydown", handleSpacebar);
    return () => window.removeEventListener("keydown", handleSpacebar);
  }, [isActive, isJumping, isGameOver]); // 최신 상태 유지를 위해 의존성 배열에 추가

  // 4. 게임 루프 및 충돌 감지
  useEffect(() => {
    if (isActive && !isGameOver) {
      gameLoopRef.current = setInterval(() => {
        const rider = riderRef.current;
        const obstacle = obstacleRef.current;

        if (rider && obstacle) {
          const riderTop = parseInt(
            window.getComputedStyle(rider).getPropertyValue("top"),
          );
          const obstacleLeft = parseInt(
            window.getComputedStyle(obstacle).getPropertyValue("left"),
          );

          // 충돌 판정 (장애물이 라이더 위치에 있고, 라이더가 점프 중이 아닐 때)
          if (obstacleLeft > 0 && obstacleLeft < 50 && riderTop >= 150) {
            setIsGameOver(true);
            clearInterval(gameLoopRef.current);
          } else {
            setScore((prev) => prev + 1);
          }
        }
      }, 50);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [isActive, isGameOver]);

  const restartGame = () => {
    setIsGameOver(false);
    setScore(0);
  };

  const closeGame = () => {
    setIsActive(false);
    setIsGameOver(false);
    setScore(0);
  };

  if (!isActive) return null;

  return (
    <div className="eco-rider-overlay" onPointerDown={jump}>
      <div className="eco-rider-container">
        {/* 게임 종료 화면 */}
        {isGameOver && (
          <div className="game-over-screen">
            <h2>배달 완료! 🌿</h2>
            <p>모은 나뭇잎(점수): {Math.floor(score / 10)}장</p>
            <div className="btn-group">
              <button onClick={restartGame}>다시 달리기</button>
              <button onClick={closeGame}>게임 종료</button>
            </div>
          </div>
        )}

        {/* 게임 화면 */}
        <div className="score-board">점수: {Math.floor(score / 10)}</div>
        <div className="road"></div>

        {/* 라이더 */}
        <div ref={riderRef} className={`rider ${isJumping ? "jump" : ""}`}>
          🚴‍♂️
        </div>

        {/* 매연 장애물 */}
        {!isGameOver && (
          <div ref={obstacleRef} className="obstacle">
            🛢️
          </div>
        )}

        <div className="help-text">
          스페이스바 또는 화면을 클릭하여 점프하세요!
        </div>
      </div>
    </div>
  );
};

export default EcoRider;
