import React, { useState, useEffect } from "react";
import styles from "../manager/ManagerReviewComment.module.css";
import axios from "axios";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Pagination from "../../../components/commons/Pagination";

const ManagerReviewComment = () => {
  const [reviews, setReviews] = useState([]); // 전체 리뷰 데이터
  const [filteredReviews, setFilteredReviews] = useState([]); // 필터링된 리뷰 데이터

  //  날짜 필터링 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //  페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const fetchReviews = async () => {
    try {
      const backHost = import.meta.env.VITE_BACKSERVER;
      const res = await axios.get(`${backHost}/admin/reviews`);
      const data = res.data ?? [];
      setReviews(data);
      setFilteredReviews(data); // 초기값은 전체 데이터
    } catch (err) {
      console.error("❌ 리뷰 목록 로드 실패!");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  //  페이지 변경 시 최상단 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  //  날짜 필터링 적용 함수
  useEffect(() => {
    if (startDate && endDate) {
      if (startDate > endDate) {
        alert("시작일이 종료일보다 클 수 없습니다.");
        setEndDate(""); // 잘못된 선택 시 초기화
        return;
      }

      const filtered = reviews.filter((review) => {
        const rDate = review.reviewDate;
        return rDate >= startDate && rDate <= endDate;
      });

      setFilteredReviews(filtered);
      setCurrentPage(1);
    } else if (!startDate && !endDate) {
      // 두 날짜가 모두 비었을 때는 전체 데이터 보여주기 (초기화 대응)
      setFilteredReviews(reviews);
    }
  }, [startDate, endDate, reviews]); // 날짜나 원본 데이터가 바뀌면 실행

  //  필터 초기화
  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilteredReviews(reviews);
    setCurrentPage(1);
  };

  //  현재 페이지에 해당하는 데이터 계산 (filteredReviews 기준)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>리뷰 관리</h2>

      {/*  날짜 필터 부분 클래스명 수정 */}
      <div className={styles.filter_row}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className={styles.reviewList}>
        {filteredReviews.length === 0 ? (
          <p className={styles.noData}>해당 기간에 등록된 리뷰가 없습니다.</p>
        ) : (
          <>
            {currentItems.map((review) => (
              <div key={review.orderId} className={styles.reviewCard}>
                <div className={styles.storeHeader}>
                  <span className={styles.storeTag}>
                    {review.storeName || `상점(${review.storeId})`}
                  </span>
                </div>

                <div className={styles.customerSection}>
                  <div className={styles.userInfo}>
                    <img
                      src={
                        review.memberProfile
                          ? `${review.memberProfile}`
                          : "/image/default-user.png"
                      }
                      alt="profile"
                      className={styles.userAvatar}
                    />
                    <div className={styles.userNameArea}>
                      <span className={styles.userName}>
                        {review.memberId} 고객님
                      </span>
                      <div className={styles.stars}>
                        {"★".repeat(review.reviewRating)}
                        {"☆".repeat(5 - review.reviewRating)}
                      </div>
                    </div>
                    <span className={styles.date}>{review.reviewDate}</span>
                  </div>

                  <p className={styles.menuName}>
                    주문 메뉴: {review.menuName}
                  </p>
                  <p className={styles.content}>{review.reviewContent}</p>

                  <img
                    src={
                      review.reviewThumb
                        ? `${review.reviewThumb}`
                        : "/image/no-image.png"
                    }
                    alt="리뷰사진"
                    className={styles.reviewImg}
                    onError={(e) => {
                      e.target.src = "/image/no-image.png";
                    }}
                  />
                </div>

                <div className={styles.bossSection}>
                  {review.reviewCommentContent && (
                    <div className={styles.replyCompleted}>
                      <p className={styles.bossTitle}>↳ 사장님 답글</p>
                      <p className={styles.replyContent}>
                        {review.reviewCommentContent}
                      </p>
                      <span className={styles.replyDate}>
                        {review.reviewCommentDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 페이지네이션 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerReviewComment;
