import React, { useContext } from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useContext(AuthContext);

  // 유저 등급에 따른 고객센터 경로 설정 함수
  const getCSPath = () => {
    // user가 없거나 memberGrade가 없을 경우를 대비해 안전하게 접근
    const grade = user?.memberGrade;

    if (grade === 1) {
      return "/mypage/user/userCS"; // 일반 유저
    } else if (grade === 2) {
      return "/mypage/manager/managerCS"; // 관리자/매니저
    } else {
      return "/mypage/user/userCS";
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 상단 푸터 영역 */}
        <div className={styles.top_section}>
          <div className={styles.brand_info}>
            <h2 className={styles.slogan}>" No BS, Just Clean Delivery. "</h2>
            <p className={styles.brand_name}>
              GReen Carry™ — A New Standard for Sustainable Delivery.
            </p>
            <div className={styles.sns_links}>
              <a
                href="https://docs.google.com/spreadsheets/d/1y5An1r5wMXSMTQPvI4N7ahxKFxeL8jKXqveL0prBrEk/edit?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Spec
              </a>
              <span className={styles.one_divider}>|</span>
              <a
                href="https://www.erdcloud.com/d/jihoxxucLefwcYJMj"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                ERD
              </a>
              <span className={styles.one_divider}>|</span>
              <a
                href="https://www.figma.com/design/23TrLwzZlitTNLkalzGG44/GreenCarry?node-id=0-1&t=219nPYaQOkhi9IX7-1"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                Figma
              </a>
              <span className={styles.one_divider}>|</span>
              <a
                href="https://github.com/JavaSinged/green_carry"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                GitHub
              </a>
            </div>
          </div>

          <div className={styles.link_groups}>
            <div className={styles.link_column}>
              <h4>Platform</h4>
              <ul>
                <li>Zero Waste Delivery</li>
                <li>Plastic-Free Zone</li>
                <li>Every Box Matters</li>
              </ul>
            </div>
            <div className={styles.link_column}>
              <h4>Impact</h4>
              <ul>
                <li>Small Steps, Big Change</li>
                <li>Cycle of Kindness</li>
                <li>Sustainable Future</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* 하단 푸터 영역 */}
        <div className={styles.bottom_section}>
          <div className={styles.company_info}>
            <p>
              <span className={styles.highlight}>CEO.</span> 신지웅
              <span className={styles.one_divider}>|</span> Seoul, KR
              (123-45-67890)
            </p>
            <div className={styles.csInfo}>
              <span>CS. 1600-0000</span>
              <span className={styles.one_divider}> | </span>
              {/* getCSPath() 호출 결과에 따라 다이나믹하게 링크 변경 */}
              <Link to={getCSPath()} className={styles.footerLink}>
                자주 묻는 질문
              </Link>
              <span className={styles.one_divider}> | </span>
              <span>partner@greencarry.com</span>
            </div>
          </div>

          <div className={styles.legal_info}>
            <div className={styles.legal_links}>
              <span>React</span>
              <span className={styles.one_divider}>|</span>
              <span>Spring</span>
              <span className={styles.one_divider}>|</span>
              <span>Oracle DB</span>
            </div>
            <p className={styles.copyright}>
              © 2026. <strong>GReen Carry™</strong>. All footprints offset. 🌱
            </p>
          </div>
        </div>
      </div>

      <div className={styles.static_garden_wrap}>
        <div className={styles.garden_icons}>
          <span className={styles.item}>🍄</span>
          <span className={styles.item}>🌱</span>
          <span className={styles.item}>🌼</span>
          <span className={styles.item}>🐰</span>
          <span className={styles.item}>🍀</span>
          <span className={styles.item}>🌸</span>
        </div>
        <div className={styles.garden_text}>
          <h4>"당신의 발걸음이 지구를 다시 숨쉬게 합니다"</h4>
          <p>GreenCarry와 함께해주셔서 감사합니다. 🌍✨</p>
        </div>
      </div>
    </footer>
  );
}
