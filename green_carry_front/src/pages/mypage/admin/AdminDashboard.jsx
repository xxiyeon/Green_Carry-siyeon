import { useState } from "react";
import styles from "./AdminDashboard.module.css";
import DashboardStats from "./components/DashboardStats";
import InquiryManagement from "./components/InquiryManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className={styles.dashboardContainer}>
      {/* 상단 탭 메뉴 */}
      <div className={styles.tabContainer}>
        <div
          className={`${styles.slideIndicator} ${
            activeTab === "inquiry" ? styles.right : styles.left
          }`}
        ></div>
        <button
          className={`${styles.tabButton} ${
            activeTab === "dashboard" ? styles.activeText : ""
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          대시보드
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "inquiry" ? styles.activeText : ""
          }`}
          onClick={() => setActiveTab("inquiry")}
        >
          회원 문의 내역
        </button>
      </div>

      {/* 탭 내용 분기 처리 */}
      {activeTab === "dashboard" ? <DashboardStats /> : <InquiryManagement />}
    </div>
  );
}
