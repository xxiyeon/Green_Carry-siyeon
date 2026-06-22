import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";
import axios from "axios";

const TotalSalesChart = () => {
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
    // 백엔드에서 데이터 바로 받아오기
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/api/sales/stats`)
      .then((res) => {
        // 🚨 카테고리 글자 변환 (ex: "03월" -> "MAR")
        const engCategories = res.data.categories.map((monthStr) => {
          // 서버에서 온 글자가 "03월" 이라면, monthMap에서 "MAR"를 꺼냄
          // 혹시 맵에 없는 이상한 글자면 원래 글자 그대로 둠
          return monthMap[monthStr] || monthStr;
        });

        setChartData({
          categories: engCategories, // 변환된 영문 배열을 꽂아줌
          currentSeries: res.data.currentSeries,
          pastSeries: res.data.pastSeries,
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

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },

    colors: ["#ffb300", "#2e8147"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },

      labels: {
        style: { colors: "#999", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val / 10000).toLocaleString() + "만원",
        style: { colors: "#999" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock}>
        <h4 className={styles.title}>전 가맹점 매출 통계</h4>
        <div
          className={styles.mainValue}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {currentTotal.toLocaleString()}원
          <span
            className={styles.badge}
            style={{ color: growthRate >= 0 ? "#2e8147" : "#e74c3c" }}
          >
            {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
          </span>
        </div>
        <p className={styles.subTitle}>Past 6 months</p>
      </div>

      {chartData.categories?.length > 0 && (
        <Chart options={options} series={series} type="bar" height={300} />
      )}
    </div>
  );
};

export default TotalSalesChart;
