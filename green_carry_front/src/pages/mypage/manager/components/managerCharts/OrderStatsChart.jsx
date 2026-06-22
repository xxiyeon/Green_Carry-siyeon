import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const OrderStatsChart = ({ data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <div className={styles.noData}>당월 주문 데이터가 존재하지 않습니다.</div>
    );
  }

  const series = data.map((item) => item.percent || 0);

  const labels = data.map((item) => {
    if (item.deliveryType === 1) return "포장";
    if (item.deliveryType === 2) return "도보 & 자전거";
    if (item.deliveryType === 3) return "오토바이";
    return "기타";
  });

  const chartColors = data.map((item) => {
    if (item.deliveryType === 1) return "var(--color-point)";
    if (item.deliveryType === 2) return "var(--color-brand)";
    return "var(--color-info)";
  });

  const totalAmount = data.reduce(
    (sum, item) => sum + (item.seriesAmount || 0),
    0,
  );
  const totalOrderCount = data.reduce(
    (sum, item) => sum + (item.orderCount || 0),
    0,
  );

  const options = {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#666",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              offsetY: 10,
              formatter: (val) => val + "%",
            },
            total: {
              show: true,
              showAlways: true,
              label: "당월 주문 금액",
              fontSize: "14px",
              color: "#666",
              formatter: () => {
                return totalAmount > 0
                  ? totalAmount.toLocaleString() + "원"
                  : "0원";
              },
            },
          },
        },
      },
    },
    colors: chartColors,
    labels: labels,
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    tooltip: {
      y: {
        formatter: function (val, opts) {
          const index = opts.seriesIndex;
          const originalData = data[index];
          return `${(originalData.seriesAmount || 0).toLocaleString()}원 (${originalData.orderCount || 0}건)`;
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>주문 통계</span>
        <button
          className={styles.viewMoreBtn}
          onClick={() => {
            navigate("/mypage/manager/orders");
          }}
        >
          View more
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        <span>
          {totalAmount !== undefined && totalAmount !== null
            ? totalAmount.toLocaleString()
            : 0}
          원
        </span>
        <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>
          (총 {totalOrderCount}건)
        </span>
      </div>

      <Chart options={options} series={series} type="donut" height={350} />
    </div>
  );
};

export default OrderStatsChart;
