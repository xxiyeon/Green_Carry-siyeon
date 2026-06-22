import React, { useState, useEffect, useRef } from "react";
import "./EcoLightSwitch.css";

const EcoLightSwitch = () => {
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const startY = useRef(0);

  // 다크모드 상태 변경 시 글로벌 클래스 추가
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("eco-dark-mode");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("eco-dark-mode");
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDarkMode]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startY.current = e.clientY;
    //  마우스를 강제로 꽉 잡음 (드래그 안 끊김)
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY.current;

    if (deltaY > 0 && deltaY < 120) {
      setPullY(deltaY);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    //  잡았던 마우스 놓아주기
    e.target.releasePointerCapture(e.pointerId);

    // 80px 이상 당겼으면 스위치 작동
    if (pullY > 80) {
      setIsDarkMode(!isDarkMode);
    }
    setPullY(0); // 탄성 복귀
  };

  return (
    <>
      <div className="eco-switch-container">
        <div
          className="eco-string"
          style={{
            height: `${80 + pullY}px`,
            transition: isDragging
              ? "none"
              : "height 0.4s cubic-bezier(0.5, 2, 0.5, 0.8)",
          }}
        ></div>

        {/*  손잡이에 직접 이벤트 바인딩 + transform 삭제 (줄이 밀어주는 대로만 움직임) */}
        <div
          className="eco-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp} // 화면 밖으로 나갔을 때 대비
          style={{
            transition: isDragging
              ? "none"
              : "transform 0.4s cubic-bezier(0.5, 2, 0.5, 0.8)",
          }}
        ></div>
      </div>

      {/* 절전 모드 오버레이 */}
      <div className={`eco-dark-overlay ${isDarkMode ? "active" : ""}`}>
        {isDarkMode && (
          <div className="eco-dark-message">🌱 에코 전력 절감 모드 가동 중</div>
        )}
      </div>
    </>
  );
};

export default EcoLightSwitch;
