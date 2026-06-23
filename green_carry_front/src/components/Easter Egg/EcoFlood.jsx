import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./EcoFlood.css";

const EcoFlood = () => {
  const [isActive, setIsActive] = useState(false);
  const [waterLevel, setWaterLevel] = useState(0);
  const waterRef = useRef(null);
  const targetsDataRef = useRef([]);
  const animationFrameId = useRef(null);

  // 1. 'flood' 타이핑 감지
  useEffect(() => {
    let keys = [];
    const secretWord = "flood";
    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        startFlood();
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startFlood = () => {
    if (isActive) return;
    setIsActive(true);
    setWaterLevel(0);

    Swal.fire({
      title: "🌊 해수면 상승 경보",
      text: "지구 온난화로 인해 모든 매장이 수몰 위기에 처했습니다!",
      icon: "info",
      confirmButtonColor: "#0277bd",
    });
  };

  // 배경 스크롤 잠금
  useEffect(() => {
    if (isActive) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    //  화면의 거의 모든 요소를 휩쓸기 대상으로 선정
    const allElements = document.querySelectorAll(
      "header, nav, section, .card_item, img, h1, h2, h3, p, button, .banner_slide, .category_item",
    );

    const validTargets = Array.from(allElements).filter((el) => {
      if (el.closest(".swal2-container") || el.closest(".eco-flood-overlay"))
        return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 5 && rect.height > 5;
    });

    targetsDataRef.current = validTargets.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        el,
        rect,
        isSwept: false,
        originalStyle: {
          filter: el.style.filter || "none",
          transform: el.style.transform || "none",
          position: el.style.position || "static",
        },
        //  휩쓸려갈 때의 물리 값
        vx: (Math.random() - 0.5) * 15, // 좌우로 밀리는 속도
        vRot: (Math.random() - 0.5) * 30, // 회전 속도
        phase: Math.random() * Math.PI * 2, // 파도 타는 타이밍
      };
    });

    let h = 0;
    const updateFlood = () => {
      h += 0.15; // 물이 차오르는 속도
      setWaterLevel(h);

      if (waterRef.current) waterRef.current.style.height = `${h}vh`;

      const viewH = window.innerHeight;
      const waterTopY = viewH * (1 - h / 100);

      targetsDataRef.current.forEach((data) => {
        // 물이 요소의 하단에 닿았을 때 "휩쓸림" 시작
        if (!data.isSwept && waterTopY <= data.rect.bottom) {
          data.isSwept = true;
          const el = data.el;
          el.style.setProperty("position", "fixed", "important");
          el.style.setProperty("left", `${data.rect.left}px`, "important");
          el.style.setProperty("top", `${data.rect.top}px`, "important");
          el.style.setProperty("width", `${data.rect.width}px`, "important");
          el.style.setProperty("z-index", "10000", "important");
          el.style.setProperty("pointer-events", "none", "important");
          el.classList.add("eco-swept");
        }

        if (data.isSwept) {
          const depth = Math.max(0, data.rect.top - waterTopY);

          //  물리 시뮬레이션: 물의 흐름에 따라 옆으로 밀리고 둥둥 뜸
          const driftX = data.vx * (h / 20); // 수위가 높을수록 더 멀리 밀림
          const floatY = Math.sin(h * 0.1 + data.phase) * 10 - depth; // 물 위로 뜨려는 힘
          const rot = data.vRot * (h / 50);

          data.el.style.transform = `translate3d(${driftX}px, ${floatY}px, 0) rotate(${rot}deg)`;

          // 수심에 따른 시각 효과 (푸른 필터 적용)
          const blueFilter = Math.min(depth / 5, 50);
          data.el.style.filter = `hue-rotate(${blueFilter}deg) brightness(${1 - depth / 800}) blur(${Math.min(depth / 100, 2)}px)`;
        }
      });

      if (h >= 105) {
        cancelAnimationFrame(animationFrameId.current);
        setTimeout(finishFlood, 1000);
      } else {
        animationFrameId.current = requestAnimationFrame(updateFlood);
      }
    };

    animationFrameId.current = requestAnimationFrame(updateFlood);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isActive]);

  const finishFlood = () => {
    Swal.fire({
      title: "도시 수몰 완료",
      html: `기후 위기로 인해 사이트의 모든 데이터가 유실되었습니다.<br/><b>우리는 지금 당장 행동해야 합니다.</b>`,
      icon: "warning",
      confirmButtonText: "복구하기",
      confirmButtonColor: "#0277bd",
    }).then(() => {
      setIsActive(false);
      resetStyles();
    });
  };

  const resetStyles = () => {
    targetsDataRef.current.forEach((data) => {
      const el = data.el;
      el.style.removeProperty("position");
      el.style.removeProperty("left");
      el.style.removeProperty("top");
      el.style.removeProperty("width");
      el.style.removeProperty("z-index");
      el.style.removeProperty("pointer-events");
      el.style.transform = data.originalStyle.transform;
      el.style.filter = data.originalStyle.filter;
      el.classList.remove("eco-swept");
    });
  };

  if (!isActive) return null;

  return (
    <div className="eco-flood-overlay">
      <div className="flood-status">
        <span className="status-label">SEA LEVEL RISING</span>
        <span className="status-value">+{(waterLevel * 0.5).toFixed(1)}m</span>
      </div>
      <div ref={waterRef} className="eco-water-level">
        <div className="eco-wave eco-wave1"></div>
        <div className="eco-wave eco-wave2"></div>
        <div className="eco-wave eco-wave3"></div>
      </div>
    </div>
  );
};

export default EcoFlood;
