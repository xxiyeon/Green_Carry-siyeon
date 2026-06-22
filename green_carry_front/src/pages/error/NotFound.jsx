import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  //  상태 관리: 심어진 꽃들의 정보와 미션 완료 여부
  const [flowers, setFlowers] = useState([]);
  const [isRestored, setIsRestored] = useState(false);

  // 사용할 꽃/풀 이모지
  const flowerEmojis = ["🌸", "🌼", "🌷", "🌹", "🌿", "🍀", "☘️"];

  //  클릭 시 꽃 심기 핸들러
  const handlePlantFlower = (e) => {
    if (isRestored) return; // 미션 완료 시 중단

    const newFlower = {
      id: Date.now(),
      x: e.pageX,
      y: e.pageY,
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
      rotate: (Math.random() - 0.5) * 30, // 살짝 기울기
      scale: Math.random() * 0.4 + 0.8, // 크기 다양화
    };

    setFlowers((prev) => [...prev, newFlower]);
  };

  //  10개 달성 시 미션 완료 처리
  useEffect(() => {
    if (flowers.length === 10 && !isRestored) {
      setIsRestored(true);

      // GreenCarry 커스텀 Swal 팝업
      Swal.fire({
        icon: "success",
        title: "🌍 지구가 회복되었습니다!",
        text: "에코 히어로님의 정성으로 황무지에 꽃이 피어났습니다.",
        confirmButtonText: "홈으로 돌아가기",
        customClass: {
          popup: "greencarry-swal-popup",
          title: "greencarry-swal-title",
          confirmButton: "greencarry-swal-confirm-button",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) navigate("/");
      });
    }
  }, [flowers, isRestored, navigate]);

  return (
    <div className={styles.container} onClick={handlePlantFlower}>
      {/*  1층: 기본 황무지 배경 (처음엔 보이고, 완료 시 사라짐) */}
      <div
        className={`${styles.bg_layer} ${styles.wasteland} ${isRestored ? styles.fade_out : ""}`}
      ></div>

      {/*  2층: 복구된 숲 배경 (처음엔 숨겨져 있다가, 완료 시 나타남) */}
      <div
        className={`${styles.bg_layer} ${styles.forest} ${isRestored ? styles.fade_in : ""}`}
      ></div>
      <div className={styles.background_overlay}></div>

      {flowers.map((f) => (
        <span
          key={f.id}
          className={styles.flower_particle}
          style={{
            left: f.x,
            top: f.y,
            transform: `translate(-50%, -50%) rotate(${f.rotate}deg) scale(${f.scale})`,
          }}
        >
          {f.emoji}
        </span>
      ))}

      {/*  메인 컨텐츠 영역 */}
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>

        <h2 className={styles.status_text}>
          {isRestored ? "생명이 돌아왔습니다! 🌱" : "여기는 아직 황무지입니다"}
        </h2>

        <p className={styles.message}>
          {isRestored
            ? "에코 히어로님 덕분에 지구가 다시 숨을 쉽니다!"
            : "이곳은 아직 나무가 자라지 않은 황무지입니다."}
        </p>

        <p className={styles.sub_message}>
          {isRestored
            ? "이제 안전한 홈 페이지로 이동해 볼까요?"
            : "화면을 10번 클릭하여 꽃을 심고 생명력을 불어넣어 주세요."}
        </p>

        <div
          className={`${styles.counter} ${isRestored ? styles.completed : ""}`}
        >
          🌿 현재 복구도: <b>{flowers.length}</b> / 10
        </div>

        <button
          className={`${styles.home_btn} ${isRestored ? styles.active_btn : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/");
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
