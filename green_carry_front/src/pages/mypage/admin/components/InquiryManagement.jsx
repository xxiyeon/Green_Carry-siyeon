import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../AdminDashboard.module.css";
import InquiryItem from "./InquiryItem";
import Pagination from "../../../../components/commons/Pagination";

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. 초기 데이터 로드
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/cs/inquiries/list`)
      .then((res) => setInquiries(res.data))
      .catch((err) => console.error("문의 내역 불러오기 실패:", err));
  }, []);

  // 2. 필터 변경 처리
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setExpandedId(null);
  };

  // 3. 답변 등록 성공 시 리스트 업데이트 (자식 컴포넌트에서 호출됨)
  const handleAnswerSuccess = (qnaNo, answerInput) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.qnaNo === qnaNo
          ? { ...inq, qnaAnswer: answerInput, qnaStatus: 1 }
          : inq
      )
    );
    setExpandedId(null); // 등록 후 닫기
  };

  // 4. 필터링 및 페이지네이션 연산
  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === "answered") return inq.qnaAnswer !== null;
    if (filter === "unanswered") return inq.qnaAnswer === null;
    return true;
  });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInquiries = filteredInquiries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const toggleAccordion = (qnaNo) => {
    setExpandedId(expandedId === qnaNo ? null : qnaNo);
  };

  return (
    <div className={styles.fullWidthSection}>
      <div className={styles.inquiryHeader}>
        <h2 className={styles.inquiryTitle}>회원 문의 내역</h2>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${
              filter === "all" ? styles.activeFilter : ""
            }`}
            onClick={() => handleFilterChange("all")}
          >
            전체
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "answered" ? styles.activeFilter : ""
            }`}
            onClick={() => handleFilterChange("answered")}
          >
            답변완료
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "unanswered" ? styles.activeFilter : ""
            }`}
            onClick={() => handleFilterChange("unanswered")}
          >
            미답변
          </button>
        </div>
      </div>

      <div className={styles.inquiryList}>
        {currentInquiries.length > 0 ? (
          <>
            {currentInquiries.map((inq) => (
              <InquiryItem
                key={inq.qnaNo}
                inq={inq}
                expandedId={expandedId}
                onToggle={toggleAccordion}
                onAnswerSuccess={handleAnswerSuccess}
              />
            ))}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className={styles.emptyMsg}>
            <p>등록된 문의 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
