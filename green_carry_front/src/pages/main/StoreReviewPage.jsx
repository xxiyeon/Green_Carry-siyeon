import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./StoreReviewPage.module.css";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE_URL = import.meta.env.VITE_BACKSERVER?.trim() || "";
const isBrowser = typeof window !== "undefined";

export default function StoreReviewPage() {
  //  리뷰/매장 로딩과 페이지 이동을 배포 환경에서 더 안전하게 처리합니다.
  const { id } = useParams();
  const storeId = Number(id);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const reviewsPerPage = 7;

  useEffect(() => {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      navigate(-1);
      return;
    }
    //ㅎㅇ
    if (!API_BASE_URL) {
      setLoadError("서버 주소가 설정되지 않아 리뷰를 불러올 수 없습니다.");
      setIsLoading(false);
      console.error("VITE_BACKSERVER is not configured for StoreReviewPage.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError("");

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/stores/${storeId}`),
      axios.get(`${API_BASE_URL}/stores/reviews/${storeId}`),
    ]).then(([storeResult, reviewResult]) => {
      if (!isMounted) {
        return;
      }

      if (storeResult.status === "fulfilled") {
        setStoreName(String(storeResult.value.data?.storeName ?? ""));
      } else {
        console.error("매장명 로드 실패:", storeResult.reason);
      }

      if (reviewResult.status === "fulfilled") {
        setReviews(
          Array.isArray(reviewResult.value.data) ? reviewResult.value.data : [],
        );
      } else {
        console.error("리뷰 로드 실패:", reviewResult.reason);
        setReviews([]);
        setLoadError("리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [navigate, storeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews.length]);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setCurrentPage(pageNumber);

    if (isBrowser) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ArrowBackIcon
          onClick={() => navigate(-1)}
          className={styles.back_btn}
        />
        <h2>
          {storeName || "매장"} 리뷰 ({reviews.length})
        </h2>
      </div>

      <div className={styles.review_list}>
        {isLoading ? (
          <div className={styles.empty}>리뷰를 불러오는 중입니다...</div>
        ) : loadError ? (
          <div className={styles.empty}>{loadError}</div>
        ) : currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.orderId} className={styles.review_card}>
              <div className={styles.card_top}>
                <div className={styles.user_info}>
                  <div className={styles.avatar}>
                    <img
                      src={review.memberProfile || "/image/default-user.png"}
                      alt={`${review.memberId || "사용자"} 프로필`}
                      onError={(e) => {
                        e.currentTarget.src = "/image/default-user.png";
                      }}
                    />
                  </div>
                  <div className={styles.user_text}>
                    <span className={styles.user_id}>
                      {review.memberId || "익명 사용자"}
                    </span>
                    <span className={styles.date}>
                      {review.reviewDate || "-"}
                    </span>
                  </div>
                </div>
                <div className={styles.rating}>
                  {[...Array(5)].map((_, index) => (
                    <StarIcon
                      key={index}
                      className={
                        index < Number(review.reviewRating ?? 0)
                          ? styles.star_active
                          : styles.star_inactive
                      }
                    />
                  ))}
                </div>
              </div>

              <div className={styles.card_body}>
                <p className={styles.menu_name}>
                  주문메뉴: {review.menuName || "메뉴 정보 없음"}
                </p>
                <div className={styles.content_wrap}>
                  <img
                    src={review.reviewThumb || "/image/no-image.png"}
                    className={styles.review_img}
                    alt="리뷰 이미지"
                    onError={(e) => {
                      e.currentTarget.src = "/image/no-image.png";
                    }}
                  />

                  <p className={styles.text}>
                    {review.reviewContent || "리뷰 내용이 없습니다."}
                  </p>
                </div>
              </div>

              {review.reviewCommentContent && (
                <div className={styles.reply_box}>
                  <p className={styles.reply_owner}> 사장님 답글</p>
                  <p className={styles.reply_text}>
                    {review.reviewCommentContent}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.empty}>아직 작성된 리뷰가 없습니다. 🌱</div>
        )}
      </div>

      {reviews.length > reviewsPerPage && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.page_btn}
          >
            이전
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`${styles.page_number} ${
                currentPage === index + 1 ? styles.active : ""
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.page_btn}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
