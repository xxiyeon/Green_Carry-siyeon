import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "../AdminDashboard.module.css";
import { withButtonLoading } from "../../../../utils/buttonLoading";

export default function InquiryItem({
  inq,
  expandedId,
  onToggle,
  onAnswerSuccess,
}) {
  const getMemberGrade = (memberGrade) => {
    if (memberGrade === 1) return "개인고객";
    if (memberGrade === 2) return "사업자";
    return "미분류";
  };

  const [answerInput, setAnswerInput] = useState("");
  const isExpanded = expandedId === inq.qnaNo;

  const submitAnswer = withButtonLoading(async () => {
    if (!answerInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: "내용 입력",
        text: "답변 내용을 입력해주세요.",
        confirmButtonColor: "#2e8147",
      });
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKSERVER}/cs/inquiries/adminAnswer`,
        {
          qnaNo: inq.qnaNo,
          qnaAnswer: answerInput,
        },
      );

      Swal.fire({
        icon: "success",
        title: "등록 완료",
        text: "답변이 성공적으로 등록되었습니다.",
        confirmButtonColor: "#2e8147",
      });

      // 등록 성공 시 부모 컴포넌트의 리스트 상태를 업데이트하도록 요청
      onAnswerSuccess(inq.qnaNo, answerInput);
      setAnswerInput(""); // 입력창 초기화
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "등록 실패",
        text: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        confirmButtonColor: "#d33",
      });
    }
  });

  return (
    <div className={styles.inquiryItem}>
      {/* 헤더 부분 (클릭 시 아코디언 토글) */}
      <div className={styles.itemHeader} onClick={() => onToggle(inq.qnaNo)}>
        <div className={styles.itemTitleGroup}>
          <span
            className={`${styles.badge} ${
              inq.qnaAnswer ? styles.badgeAnswered : styles.badgeUnanswered
            }`}
          >
            {inq.qnaAnswer ? "답변완료" : "미답변"}
          </span>
          <span className={styles.itemTitle}>{inq.qnaTitle}</span>
        </div>
        <div className={styles.itemMeta}>
          <span
            className={`${styles.gradeBadge} ${inq.memberGrade === 1 ? styles.personal : styles.business}`}
          >
            {getMemberGrade(inq.memberGrade)}
          </span>
          <span>{inq.memberId}</span>
          <span className={styles.itemDate}>
            {new Date(inq.qnaDate).toLocaleDateString()}
          </span>
          <span className={styles.arrowIcon}>{isExpanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* 바디 부분 (아코디언 내용) */}
      {isExpanded && (
        <div className={styles.itemBody}>
          <div className={styles.questionBox}>
            <strong>Q. 문의 내용</strong>
            <p>{inq.qnaContent}</p>
          </div>

          {inq.qnaAnswer ? (
            <div className={styles.answerBox}>
              <strong>A. 답변 내용</strong>
              <p>{inq.qnaAnswer}</p>
            </div>
          ) : (
            <div className={styles.answerForm}>
              <textarea
                className={styles.answerInput}
                placeholder="답변을 입력해주세요..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                style={{
                  resize: "none",
                }} /*  요기에 크기 고정 옵션 추가했습니다! */
              />
              <button className={styles.submitBtn} onClick={submitAnswer}>
                답변 등록
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
