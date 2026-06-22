import styles from "./Signup.module.css";
import { useNavigate } from "react-router-dom";
import useEcoEffects from "../../hooks/useEcoEffects";

const Signup = () => {
  const {
    containerRef,
    bubblesRef,
    selectedBg,
    bubbleData,
    fireflyData,
    leafData,
  } = useEcoEffects();
  const navigate = useNavigate();

  return (
    <div
      className={styles.signup_container}
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {leafData &&
        leafData.map((leaf) => (
          <div
            key={leaf.id}
            className={styles.particleLeaf}
            style={{
              left: leaf.x,
              top: leaf.y,
            }}
          />
        ))}
      {fireflyData &&
        fireflyData.map((style, i) => (
          <div
            key={`firefly-${i}`}
            className={styles.firefly}
            style={{
              left: style.left,
              top: style.top,
              animationDuration: style.animationDuration,
              animationDelay: style.animationDelay,
            }}
          />
        ))}

      {bubbleData.map((style, i) => (
        <div
          key={i}
          className={styles.ecoBubble}
          ref={(el) => (bubblesRef.current[i] = el)}
          style={{
            left: style.left,
            top: style.top,
            width: style.size,
            height: style.size,
            animationDelay: style.delay,
          }}
        />
      ))}

      <header className={styles.header}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>
          GreenCarry
        </h1>
      </header>

      <main className={styles.option_paper}>
        <h2 className={styles.option_card_title}>회원가입</h2>

        <div className={styles.button_wrap}>
          <button
            className={styles.reg_button}
            onClick={() => navigate("/userSignup")}
          >
            개인 회원가입
          </button>

          <button
            className={styles.re_button}
            onClick={() => navigate("/managerSignup")}
          >
            사업자 회원가입
          </button>
        </div>

        <p className={styles.footer_text}>
          회원 정보를 잊으셨나요?
          <span
            className={styles.find_link}
            onClick={() => navigate("/account")}
          >
            아이디/비밀번호 찾기
          </span>
        </p>
      </main>
    </div>
  );
};

export default Signup;

