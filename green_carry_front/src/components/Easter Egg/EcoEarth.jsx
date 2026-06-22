import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./EcoEarth.css";

const EcoEarth = () => {
  const [isActive, setIsActive] = useState(false);

  // 1. 'earth' 타이핑 감지
  useEffect(() => {
    let keys = [];
    const secretWord = "earth";

    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        setIsActive((prev) => {
          if (!prev) {
            Swal.fire({
              title: "🌎 3D 메타버스 진입!",
              text: "마우스 휠을 굴려 지구를 돌려보세요! (종료: 'earth' 다시 입력)",
              icon: "success",
              confirmButtonColor: "#2e7d32",
            });
          }
          return !prev;
        });
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. 3D 회전 및 스크롤 가로채기
  useEffect(() => {
    if (!isActive) {
      document.body.classList.remove("eco-earth-mode");
      document.documentElement.style.removeProperty("--earth-rot");
      return;
    }

    document.body.classList.add("eco-earth-mode");
    let currentRotation = 0;

    const handleWheel = (e) => {
      e.preventDefault(); // 기본 스크롤 차단

      // 휠 굴리는 속도에 따라 회전값 누적
      currentRotation += e.deltaY * 0.05;

      // CSS 변수로 회전값 전달
      document.documentElement.style.setProperty(
        "--earth-rot",
        `${currentRotation}deg`,
      );
    };

    // passive: false를 주어야 e.preventDefault()가 작동함
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    // 우주 배경을 꾸며줄 별가루들
    <div className="eco-space-background">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="eco-star"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`,
            animationDelay: `${Math.random() * 2}s`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
          }}
        />
      ))}
      <div className="eco-earth-hud">3D SPACE NAVIGATION ONLINE</div>
    </div>
  );
};

export default EcoEarth;
