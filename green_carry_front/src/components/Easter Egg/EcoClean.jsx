import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios"; //  axios 추가
import "./EcoClean.css";

const EcoClean = () => {
  const [isActive, setIsActive] = useState(false);
  const trashNodesRef = useRef([]);
  const trashDataRef = useRef([]);
  const requestRef = useRef();

  //  1. 'clean' 타이핑 감지
  useEffect(() => {
    let keys = [];
    const secretWord = "clean";
    const handleKeyDown = (e) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-5);
      if (keys.join("") === secretWord) {
        startGame();
        keys = [];
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  //  포인트 로컬 스토리지 동기화 함수
  const syncPoints = (newPoint) => {
    const member = JSON.parse(localStorage.getItem("member"));
    if (member) {
      member.memberPoint = newPoint;
      localStorage.setItem("member", JSON.stringify(member));
    }
    localStorage.setItem("memberPoint", newPoint);
    window.dispatchEvent(new Event("storage")); // 전역 UI 갱신 신호
  };

  const startGame = () => {
    if (isActive) return;
    setIsActive(true);
    const emojis = ["🥤", "🧃", "🥡", "🗑️", "🗞️", "🥫", "🚬", "🛍️"];
    const screenW = window.innerWidth;

    trashDataRef.current = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * (screenW - 100) + 50,
      y: -100 - Math.random() * 500,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 5 + 5,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 15,
      isDragging: false,
      active: true,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
    }));

    startPhysicsLoop();
  };

  const startPhysicsLoop = () => {
    let lastFrameTime = performance.now();

    const update = async (time) => {
      const dt = (time - lastFrameTime) / 16;
      lastFrameTime = time;

      let activeCount = 0;
      const screenW = window.innerWidth;
      const floor = window.innerHeight - 80;

      trashDataRef.current.forEach((t, i) => {
        if (!t.active) return;
        activeCount++;

        if (!t.isDragging) {
          t.vy += 0.6 * dt;
          t.x += t.vx * dt;
          t.y += t.vy * dt;
          t.rot += t.vRot * dt;

          if (t.y > floor && t.x > -50 && t.x < screenW + 50) {
            t.y = floor;
            t.vy *= -0.5;
            t.vx *= 0.8;
            t.vRot *= 0.8;
          }

          if (
            t.y > window.innerHeight + 200 ||
            t.y < -300 ||
            t.x < -150 ||
            t.x > screenW + 150
          ) {
            t.active = false;
          }
        }

        const node = trashNodesRef.current[i];
        if (node) {
          if (t.active) {
            node.style.transform = `translate(${t.x}px, ${t.y}px) rotate(${t.rot}deg)`;
          } else {
            node.style.display = "none";
          }
        }
      });

      //  승리 조건 달성 시 (모든 쓰레기 청소 완료)
      if (activeCount === 0 && trashDataRef.current.length > 0) {
        cancelAnimationFrame(requestRef.current);
        trashDataRef.current = []; // 중복 호출 방지
        handleGameWin(); //  포인트 지급 처리 함수 호출
        return;
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
  };

  //  게임 승리 시 서버 통신 처리
  const handleGameWin = async () => {
    const memberId = localStorage.getItem("memberId");

    if (!memberId) {
      setIsActive(false);
      Swal.fire({
        title: "로그인 필요",
        text: "포인트를 받으려면 로그인이 필요합니다.",
        icon: "info",
      });
      return;
    }

    try {
      // 서버 전송 (이벤트 코드: CLEAN_EARTH)
      const res = await axios.post(
        `${import.meta.env.VITE_BACKSERVER}/member/Addpoint/${memberId}`,
        { event_code: "CLEAN_EARTH" },
      );

      // 로컬 스토리지 동기화
      syncPoints(res.data);

      Swal.fire({
        title: "지구가 숨을 쉽니다! 🌸",
        html: `청소 완료 보너스 <b>2500P</b>가 지급되었습니다!`,
        iconHtml: "🌿",
        confirmButtonColor: "#2e7d32",
      }).then(() => setIsActive(false));
    } catch (error) {
      console.error("포인트 지급 실패:", error);
      const errorMsg =
        error.response?.status === 409
          ? "이미 청소 보상을 받으셨습니다."
          : "보상 지급 중 오류가 발생했습니다.";

      Swal.fire({
        title: "청소 완료!",
        text: errorMsg,
        icon: "info",
        confirmButtonColor: "#2e7d32",
      }).then(() => setIsActive(false));
    }
  };

  // ... (handlePointerDown, handlePointerMove, handlePointerUp 생략 - 기존 코드 유지)

  const handlePointerDown = (e, i) => {
    const t = trashDataRef.current[i];
    t.isDragging = true;
    t.lastX = e.clientX;
    t.lastY = e.clientY;
    t.lastTime = performance.now();
    t.vx = 0;
    t.vy = 0;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, i) => {
    const t = trashDataRef.current[i];
    if (!t.isDragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - t.lastTime);
    t.vx = ((e.clientX - t.lastX) / dt) * 6;
    t.vy = ((e.clientY - t.lastY) / dt) * 6;
    t.x += e.clientX - t.lastX;
    t.y += e.clientY - t.lastY;
    t.lastX = e.clientX;
    t.lastY = e.clientY;
    t.lastTime = now;
  };

  const handlePointerUp = (e, i) => {
    const t = trashDataRef.current[i];
    if (!t) return;
    t.isDragging = false;
    t.vRot = t.vx * 0.5;
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!isActive) return null;

  return (
    <div className="eco-clean-overlay">
      <div className="eco-clean-instruction">
        마우스로 플라스틱을 집어서
        <br />
        화면 밖으로 휙! 던져보세요
      </div>
      {trashDataRef.current.map((t, i) => (
        <div
          key={t.id}
          ref={(el) => (trashNodesRef.current[i] = el)}
          className="eco-trash-item"
          onPointerDown={(e) => handlePointerDown(e, i)}
          onPointerMove={(e) => handlePointerMove(e, i)}
          onPointerUp={(e) => handlePointerUp(e, i)}
          onPointerCancel={(e) => handlePointerUp(e, i)}
        >
          {t.emoji}
        </div>
      ))}
    </div>
  );
};

export default EcoClean;
