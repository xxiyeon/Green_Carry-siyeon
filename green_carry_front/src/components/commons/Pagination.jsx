import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import styles from "./Pagination.module.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages === 0) return null;

  // --- 10개 단위 그룹핑 로직 시작 ---
  const pageGroupSize = 10; // 한 그룹에 보여줄 페이지 개수
  const currentGroup = Math.ceil(currentPage / pageGroupSize); // 현재 몇 번째 그룹인지 계산

  const startPage = (currentGroup - 1) * pageGroupSize + 1; // 그룹의 시작 번호
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages); // 그룹의 끝 번호 (전체 페이지를 넘지 않게 처리)

  // 실제로 화면에 보일 숫자 배열 생성 (예: 1~10, 11~20)
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  // --- 그룹핑 로직 끝 ---

  return (
    <div className={styles.pagination}>
      {/* 이전 그룹 버튼 (startPage가 1보다 클 때만 활성화 하거나 이전 페이지로 이동) */}
      <button
        className={styles.page_btn_nav}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon fontSize="small" /> 이전
      </button>

      <div className={styles.page_numbers}>
        {/* 전체 totalPages가 아니라 계산된 pageNumbers만 map을 돌림 */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.page_num} ${
              currentPage === pageNum ? styles.active : ""
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {String(pageNum).padStart(2, "0")}
          </button>
        ))}
      </div>

      <button
        className={styles.page_btn_nav}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음 <ChevronRightIcon fontSize="small" />
      </button>
    </div>
  );
}
