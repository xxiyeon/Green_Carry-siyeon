import CarbonComparisonChart from "../../../../components/layout/chart/ComparisonBarChart";
import MemberCountChart from "../../../../components/layout/chart/MemberCountChart";
import TotalSalesChart from "../../../../components/layout/chart/TotalSalesChart";
import styles from "../AdminDashboard.module.css";

export default function DashboardStats() {
  return (
    <>
      <div className={styles.fullWidthSection}>
        <TotalSalesChart />
      </div>
      <div className={styles.fullWidthSection}>
        <CarbonComparisonChart />
      </div>
      <div className={styles.fullWidthSection}>
        <MemberCountChart />
      </div>
    </>
  );
}
