import { useState } from "react";
import styles from "./ManagerDashboard.module.css";
import StoreStats from "./components/StoreStats";
import StoreInfoEdit from "./components/StoreInfoEdit";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("stats"); // 'stats' or 'edit'

  return (
    <div className={styles.dashboardContainer}>
      {/* 상단 탭 메뉴 */}
      <div className={styles.tabContainer}>
        <div
          className={`${styles.slideIndicator} ${
            activeTab === "edit" ? styles.right : styles.left
          }`}
        ></div>
        <button
          className={`${styles.tabButton} ${
            activeTab === "stats" ? styles.activeText : ""
          }`}
          onClick={() => setActiveTab("stats")}
        >
          내 가게 통계
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "edit" ? styles.activeText : ""
          }`}
          onClick={() => setActiveTab("edit")}
        >
          내 가게 수정
        </button>
      </div>

      {activeTab === "stats" ? <StoreStats /> : <StoreInfoEdit />}
    </div>
  );
}
