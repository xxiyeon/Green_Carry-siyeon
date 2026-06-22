// CartBar.jsx
import { useNavigate } from "react-router-dom";
import useCartStore from "../../../store/useCartStore";
import styles from "./CartBar.module.css";
import { useState } from "react";

export default function CartBar() {
  const cart = useCartStore((state) => state.cart);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.totalPrice * item.quantity,
    0,
  );
  const totalCarbon = cart.reduce(
    (sum, item) =>
      sum +
      (item.reusableAppliedCarbon * item.quantity +
        item.optionCarbon * item.quantity),
    0,
  );
  const navigate = useNavigate();
  if (cart.length === 0) return null;
  return (
    <div className={styles.cart_container}>
      <button
        className={styles.cart_button}
        onClick={() => {
          navigate("/orderPage");
        }}
      >
        {/* 좌측: 수량 뱃지 */}
        <div className={styles.badge_wrap}>
          <span className={styles.quantity_badge}>{totalQuantity}</span>
        </div>

        {/* 중앙: 가격 + 탄소 절감 */}
        <div className={styles.info_wrap}>
          <span className={styles.main_text}>
            {totalPrice.toLocaleString()}원 결제하기
          </span>
          <span className={styles.carbon_text}>
            🌱 탄소 절감 {Math.floor(totalCarbon)}g
          </span>
        </div>

        {/* 우측: 빈 공간 (좌우 균형용) */}
        <div className={styles.price_wrap} />
      </button>
    </div>
  );
}
