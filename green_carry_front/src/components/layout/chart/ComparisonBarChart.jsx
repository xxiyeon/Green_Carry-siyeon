import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";
import axios from "axios";

const CarbonComparisonChart = () => {
  const [chartData, setChartData] = useState({
    categories: [],
    currentSeries: [],
    pastSeries: [],
  });
  const monthMap = {
    "01월": "Jan",
    "02월": "Feb",
    "03월": "Mar",
    "04월": "Apr",
    "05월": "May",
    "06월": "Jun",
    "07월": "Jul",
    "08월": "Aug",
    "09월": "Sep",
    "10월": "Oct",
    "11월": "Nov",
    "12월": "Dec",
  };
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/api/point/stats`)
      .then((res) => {
        const currentCarbon = res.data.currentSeries.map((val) => val / 1000);
        const pastCarbon = res.data.pastSeries.map((val) => val / 1000);
        // 🚨 카테고리 글자 변환 (ex: "03월" -> "MAR")
        const engCategories = res.data.categories.map((monthStr) => {
          // 서버에서 온 글자가 "03월" 이라면, monthMap에서 "MAR"를 꺼냄
          // 혹시 맵에 없는 이상한 글자면 원래 글자 그대로 둠
          return monthMap[monthStr] || monthStr;
        });

        setChartData({
          categories: engCategories, // 변환된 영문 배열을 꽂아줌
          currentSeries: currentCarbon,
          pastSeries: pastCarbon,
        });
      });
  }, []);

  const currentTotal =
    chartData.currentSeries?.reduce((acc, cur) => acc + cur, 0) || 0;

  const pastTotal =
    chartData.pastSeries?.reduce((acc, cur) => acc + cur, 0) || 0;

  let growthRate = 0;
  if (pastTotal > 0) {
    growthRate = ((currentTotal - pastTotal) / pastTotal) * 100;
  }

  const series = [
    { name: "2024 ~ 2025", data: chartData.pastSeries },
    { name: "2025 ~ 2026", data: chartData.currentSeries },
  ];

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    // 전역 변수 컬러에 맞춤: 포인트 오렌지, 브랜드 그린
    colors: ["#ffb300", "#2e8147"],
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: { colors: "#999", fontSize: "12px" },
      },
    },
    yaxis: {
      title: {
        text: "절감량 (Kg)",
        style: { color: "#666", fontWeight: 600 },
      },
      labels: {
        formatter: (val) => val + " Kg",
        style: { colors: "#999" },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => val + " Kg",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className={`${styles.container} ${styles.carbonContainer}`}>
      <div className={styles.headerFlex}>
        <div>
          <h3 className={styles.title}>절감된 탄소량 통계</h3>
        </div>
        <div className={styles.valueGroup}>
          <div className={styles.carbonValue}>{currentTotal.toFixed(3)} Kg</div>
          <span
            className={styles.badge2}
            style={{ color: growthRate >= 0 ? "#2e8147" : "#e74c3c" }}
          >
            {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
          </span>
        </div>
        <p className={styles.subTitle}>Past 6 months</p>
      </div>
      {chartData.categories?.length > 0 && (
        <Chart
          options={chartOptions}
          series={series}
          type="bar"
          height="100%"
        />
      )}
    </div>
  );
};

export default CarbonComparisonChart;
