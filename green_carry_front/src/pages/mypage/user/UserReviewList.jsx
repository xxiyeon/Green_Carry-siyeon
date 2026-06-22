import React, { useState, useEffect, useMemo } from "react";
import api from "../../../utils/accessToken";
import styles from "./UserReviewList.module.css";
import Swal from "sweetalert2";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Pagination from "../../../components/commons/Pagination";
import { withButtonLoading } from "../../../utils/buttonLoading";

const UserReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  //  [추가] 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 보여줄 리뷰 개수
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const backHost = import.meta.env.VITE_BACKSERVER;

  const getMyReviews = async () => {
    try {
      const memberId = localStorage.getItem("memberId");
      if (!memberId) return;

      const res = await api.get(`/member/myReviewList/${memberId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("리뷰 로드 실패:", err);
    }
  };

  useEffect(() => {
    getMyReviews();
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  //  [추가] 필터 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const deleteReview = withButtonLoading(async (_event, orderId) => {
    Swal.fire({
      title: "리뷰를 삭제하시겠습니까?",
      text: "삭제된 리뷰는 복구할 수 없으며 에코 포인트가 차감될 수 있습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#246337",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/member/deleteReview/${orderId}`);
          if (res.data === "SUCCESS") {
            Swal.fire(
              "삭제 성공",
              "리뷰가 정상적으로 삭제되었습니다.",
              "success",
            );
            getMyReviews();
          }
        } catch (err) {
          Swal.fire("에러", "리뷰 삭제 중 오류가 발생했습니다.", "error");
        }
      }
    });
  });

  const filteredReviews = reviews.filter((review) => {
    if (!review.reviewDate) return true;
    const reviewMonth = review.reviewDate.substring(0, 7);
    if (startDate && !endDate) return reviewMonth >= startDate;
    if (!startDate && endDate) return reviewMonth <= endDate;
    if (startDate && endDate)
      return reviewMonth >= startDate && reviewMonth <= endDate;
    return true;
  });

  //  [추가] 현재 페이지 리뷰 계산 로직
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className={styles.container}>
      <div className={styles.filter_row}>
        <input
          type="month"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={currentMonthStr}
        />
        <span>~</span>
        <input
          type="month"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          max={currentMonthStr}
        />
      </div>

      <div className={styles.review_list}>
        {/*  [수정] filteredReviews 대신 currentReviews 사용 */}
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.orderId} className={styles.review_card}>
              <div className={styles.card_header}>
                <div className={styles.store_info}>
                  <span className={styles.store_name}>{review.storeName}</span>
                  <span className={styles.menu_detail}>
                    {review.menuName}
                    {review.extraCount > 0 &&
                      ` 외 ${review.extraCount}개`} |{" "}
                    {(
                      review.totalPrice + (review.deliveryPrice || 0)
                    ).toLocaleString()}
                    원
                  </span>
                  <span className={styles.order_date}>{review.reviewDate}</span>
                </div>
                <button
                  className={styles.delete_btn}
                  onClick={(e) => deleteReview(e, review.orderId)}
                >
                  삭제
                </button>
              </div>

              <div className={styles.card_body}>
                <img
                  src={
                    review.reviewThumb
                      ? review.reviewThumb.startsWith("/")
                        ? `${review.reviewThumb}`
                        : `${review.reviewThumb}`
                      : "/image/no-image.png"
                  }
                  alt="리뷰사진"
                  className={styles.review_img}
                  onError={(e) => {
                    e.target.src = "/image/no-image.png";
                  }}
                />

                <div className={styles.chat_area}>
                  <div className={styles.user_bubble}>
                    <div className={styles.user_top}>
                      <div className={styles.avatar}>
                        <img
                          src={
                            review.memberProfile
                              ? `${review.memberProfile}`
                              : "/image/default-user.png"
                          }
                          alt="avatar"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <span className={styles.member_id}>
                        {review.memberId}
                      </span>

                      <span className={styles.star_rating}>
                        {review.reviewRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className={styles.bubble_content}>
                      {review.reviewContent}
                    </div>
                  </div>

                  {review.reviewCommentContent && (
                    <div className={styles.owner_bubble}>
                      <div className={styles.bubble_content}>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#2f8f46",
                            fontSize: "13px",
                            marginBottom: "4px",
                            display: "inline-block",
                          }}
                        >
                          ↳ 사장님 답글..
                        </span>
                        <br />
                        {review.reviewCommentContent}
                        <span className={styles.reply_date}>
                          {review.reviewCommentDate}
                        </span>
                      </div>
                      <div className={styles.avatar_owner}>
                        <img
                          src="/image/chef.png"
                          alt="요리사 아이콘"
                          style={{
                            width: "30px",
                            height: "30px",
                            verticalAlign: "middle",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.no_data}>
            해당 기간에 작성한 리뷰가 없습니다. 🌱
          </div>
        )}
      </div>

      {/*  [추가] 페이지네이션 UI */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default UserReviewList;
