import axios from "axios";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import styles from "./chart.module.css";

const MemberCountChart = () => {
  const [series, setSeries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/member`)
      .then((res) => {
        const users = res.data.filter((user) => user.memberGrade !== 0);
        setTotalCount(users.length);

        const generalData = Array(12).fill(0);
        const businessData = Array(12).fill(0);

        users.forEach((user) => {
          if (user.enrollDate) {
            const monthIndex = parseInt(user.enrollDate.split("-")[1], 10) - 1;

            if (user.memberGrade === 1) {
              generalData[monthIndex]++;
            } else if (user.memberGrade === 2) {
              businessData[monthIndex]++;
            }
          }
        });

        setSeries([
          { name: "일반 회원", data: generalData },
          { name: "사업자 회원", data: businessData },
        ]);
      })
      .catch((err) => console.log("데이터 불러오기 실패:", err));
  }, []);

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    colors: ["#ffb300", "#2e8147"], // 일반(포인트 오렌지), 사업자(브랜드 그린)
    dataLabels: { enabled: false },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      labels: {
        formatter: (val) => parseInt(val) + "명",
      },
      decimalsInFloat: 0,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBlock}>
        <h4 className={styles.title}>전체 가입 회원 수</h4>
        <h2 className={styles.mainValue}>{totalCount.toLocaleString()}명</h2>
        <p className={styles.subTitle}>월별 일반/사업자 가입 현황</p>
      </div>

      {series.length > 0 ? (
        <Chart options={options} series={series} type="bar" height="100%" />
      ) : (
        <p className={styles.loading}>데이터 로딩 중...</p>
      )}
    </div>
  );
};

export default MemberCountChart;
