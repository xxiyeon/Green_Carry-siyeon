import Chart from "react-apexcharts";
import styles from "./managerChart.module.css";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";

const ReviewStatsChart = ({ data }) => {
  const navigate = useNavigate();

  //  [수정됨] 데이터가 없거나, 총 리뷰 건수가 0건일 때 통일된 문구 출력
  if (!data || !data.series || data.totalCount === 0) {
    return (
      <div className={styles.noData}>당월 리뷰 데이터가 존재하지 않습니다.</div>
    );
  }

  const options = {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 0,
        donut: {
          size: "60%",
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
              formatter: (val) => (val ? val.toLocaleString() + "%" : "0%"),
            },
            total: {
              show: true,
              showAlways: true,
              label: "평균 별점",
              fontSize: "14px",
              color: "#666",
              formatter: () =>
                data.avgRating ? data.avgRating.toFixed(1) + "점" : "0점",
            },
          },
        },
      },
    },
    colors: ["var(--color-brand)", "#81c784", "#ffb300", "#ff8a65", "#e57373"],
    labels: ["5점", "4점", "3점", "2점", "1점"],
    legend: { show: false },
    dataLabels: { enabled: false },

    tooltip: {
      enabled: true,
      y: {
        title: {
          formatter: (seriesName) => `${seriesName} :`,
        },
        formatter: (val, opts) => {
          if (data.counts && data.counts[opts.seriesIndex] !== undefined) {
            return `(${data.counts[opts.seriesIndex]}건)`;
          }
          const calculatedCount = Math.round(
            (val / 100) * (data.totalCount || 0),
          );
          return `(${calculatedCount}건)`;
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>리뷰 통계</span>
        <button
          className={styles.viewMoreBtn}
          onClick={() => {
            navigate("/mypage/manager/reviews");
          }}
        >
          View more
          <OpenInNewIcon style={{ fontSize: "1rem", marginLeft: "4px" }} />
        </button>
      </div>

      <div className={styles.mainValue}>
        <span>{data.avgRating?.toFixed(1)}점</span>
        <span style={{ fontSize: "1rem", color: "#666", fontWeight: "normal" }}>
          (총 {data.totalCount}건)
        </span>
        {data.changePercent > 0 && (
          <span className={styles.changePercent} style={{ marginLeft: "auto" }}>
            ↑ {data.changePercent}% 지난 주보다
          </span>
        )}
      </div>

      <Chart options={options} series={data.series} type="donut" height={220} />

      <div className={styles.legendContainer}>
        {options.labels.map((label, index) => {
          const percent = data.series[index] || 0;
          const count =
            data.counts && data.counts[index] !== undefined
              ? data.counts[index]
              : Math.round((percent / 100) * (data.totalCount || 0));

          return (
            <div key={label} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: options.colors[index] }}
              ></span>
              <span className={styles.legendLabel}>{label}</span>
              <span className={styles.legendValue}>
                {percent}% ({count}건)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewStatsChart;
