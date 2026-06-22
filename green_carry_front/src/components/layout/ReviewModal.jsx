import React, { useState, useRef } from "react";
import api from "../../utils/accessToken";
import Swal from "sweetalert2";
import styles from "./ReviewModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { withButtonLoading } from "../../utils/buttonLoading";

export default function ReviewModal({ order, onClose }) {
  const backHost = import.meta.env.VITE_BACKSERVER;
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = withButtonLoading(async () => {
    console.log("지금 order 객체 내용:", order);
    if (content.length < 10) {
      return Swal.fire("알림", "리뷰를 10자 이상 작성해주세요.", "warning");
    }
    const memberId = localStorage.getItem("memberId");

    const formData = new FormData();
    formData.append("orderId", order.orderId);
    formData.append("reviewContent", content);
    formData.append("reviewRating", rating);
    formData.append("memberId", memberId);
    formData.append("storeId", order.storeId);
    if (image) formData.append("uploadFile", image);

    try {
      const res = await api.post("/member/insertReview", formData);

      if (res.data === "SUCCESS") {
        Swal.fire("성공", "소중한 리뷰가 등록되었습니다! 🌱", "success").then(
          () => {
            onClose();
            window.location.reload();
          },
        );
      }
    } catch (err) {
      // 백엔드에서 보낸 에러 메시지(String)를 추출
      const errorMessage = err.response?.data;

      // errorMessage가 객체일 경우를 대비해 처리
      const finalMsg =
        typeof errorMessage === "string"
          ? errorMessage
          : "데이터 전송 형식이 올바르지 않습니다. (400 Bad Request)";

      Swal.fire("등록 실패", finalMsg, "error");
    }
  });

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <CloseIcon className={styles.close_btn} onClick={onClose} />

        <h2 className={styles.title}>맛있게 드셨나요? 😋</h2>
        <p className={styles.subtitle}>
          솔직한 리뷰를 남겨주시면 에코 포인트를 드려요!
        </p>

        <div className={styles.order_card}>
          <img
            src={
              order.storeThumb ? `${order.storeThumb}` : "/default-image.png"
            }
            alt="store"
            className={styles.order_img}
          />
          <div className={styles.order_info}>
            <p className={styles.store_name_title}>{order.storeName}</p>

            <p
              className={styles.menu_name_text}
              style={{ fontWeight: "700", color: "#222", marginTop: "4px" }}
            >
              {order.menuName}
              {order.extraCount > 0 && (
                <span style={{ color: "#246337", marginLeft: "4px" }}>
                  외 {order.extraCount}건
                </span>
              )}
            </p>

            <p style={{ color: "#555", fontSize: "0.9rem", marginTop: "2px" }}>
              결제금액:{" "}
              <span style={{ fontWeight: "600" }}>
                {order.totalPrice?.toLocaleString() || 0}원
              </span>
            </p>

            {order.optionString && (
              <p
                style={{
                  color: "#888",
                  fontSize: "0.85rem",
                  marginTop: "2px",
                  lineHeight: "1.3",
                }}
              >
                옵션: {order.optionString}
              </p>
            )}

            <p className={styles.order_date_text} style={{ marginTop: "6px" }}>
              주문일자: {order.orderDate || "날짜 정보 없음"}
            </p>
          </div>
        </div>

        <div className={styles.flex_row}>
          <div className={styles.input_box}>
            <h3 className={styles.section_title}>
              사진 첨부 <span className={styles.optional_text}>(선택)</span>
            </h3>
            <div className={styles.upload_box}>
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className={styles.preview_img}
                  onClick={() => fileInputRef.current.click()}
                  title="클릭하여 사진 변경"
                />
              ) : (
                <>
                  <p className={styles.upload_hint}>
                    <span className={styles.upload_hint_bold}>포토 리뷰</span>
                    <br />
                    <span className={styles.upload_hint_sub}>
                      최대 10MB (JPG, PNG)
                    </span>
                  </p>
                  <button
                    className={styles.browse_btn}
                    onClick={() => fileInputRef.current.click()}
                  >
                    + 사진 추가하기
                  </button>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className={styles.input_box}>
            <h3 className={styles.section_title}>이 메뉴, 추천하시나요?</h3>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={`star-rating-${num}`}
                  onClick={() => setRating(num)}
                  onMouseEnter={() => setHover(num)}
                  onMouseLeave={() => setHover(0)}
                  className={
                    num <= (hover || rating)
                      ? styles.active_star
                      : styles.inactive_star
                  }
                >
                  ★
                </span>
              ))}
            </div>

            <h3 className={styles.section_title} style={{ marginTop: "20px" }}>
              어떤 점이 좋았나요?{" "}
              <span className={styles.required_text}>(최소 10자)</span>
            </h3>
            <textarea
              className={styles.textarea}
              placeholder="음식의 맛, 양, 포장 상태 등 사장님과 다른 고객들에게 도움이 되는 솔직한 리뷰를 남겨주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={300}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <button onClick={handleSubmit} className={styles.submit_btn}>
          리뷰 등록하기
        </button>
      </div>
    </div>
  );
}
