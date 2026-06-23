import styles from "./ManagerDelAccount.module.css";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import Swal from "sweetalert2";
import { withButtonLoading } from "../../../utils/buttonLoading";

const ManagerDelAccount = () => {
    const { user, logout } = useContext(AuthContext); // 현재 로그인한 유저 정보
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState(""); // 입력한 비밀번호
    const [isAgreed, setIsAgreed] = useState(false); // 마지막 체크박스 동의
    const [totalCarbon, setTotalCarbon] = useState(0); //탄소량 저장
    const [enrollDate, setEnrollDate] = useState("");  // 가입일

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }
    useEffect(() => {
        const MemberDate = async () => {
            if (user?.memberId) {
                try {
                    const token = localStorage.getItem("accessToken");

                    const response = await axios.get(
                        `${import.meta.env.VITE_BACKSERVER}/member/enroll-date`,
                        {
                            params: { memberId: user.memberId },
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    if (response.data) {
                        // DB에서 온 "2023-03-15"를 "2023년 3월"로
                        const [year, month] = response.data.split('-');
                        // parseInt를 쓰면 03이 3으로
                        setEnrollDate(`${year}년 ${parseInt(month, 10)}월`)
                    }
                } catch (err) {
                    console.log("가입일 로딩 실패", err);
                }
            }
        };
        MemberDate();
    }, [user]);



    const handleDeleteAccount = withButtonLoading(async () => {
        // 둘다 안했을 때
        if (!password && !isAgreed) {
            Swal.fire({
                icon: "warning",
                title: "앗, 놓친 게 있어요! 🔍",
                html: "원활한 탈퇴 진행을 위해<br><b>비밀번호</b>입력과 <b>동의 체크</b>가 모두 필요해요!<br>빠진 곳이 없는지 한 번만 더 확인해 주세요. 💚",
                confirmButtonColor: "#2e8147"
            });
            return;
        }
        // 체크박스 동의 여부
        if (!isAgreed) {
            Swal.fire({
                icon: "warning",
                title: "잠시만요!",
                html: "동의란에 체크해 주셔야 보내드릴 수 있어요... 훌쩍 💦",
                confirmButtonColor: "#2e8147"
            });
            return;
        }
        // 비밀번호 입력 여부
        if (!password) {
            Swal.fire({
                icon: "warning",
                title: "잠시만요!",
                html: "마지막으로 본인 확인을 위해 비밀번호가 필요해요.<br>" +
                    "한 번만 더 확인 부탁드릴게요. 💚",
                confirmButtonColor: "#2e8147"
            });
            return;
        }

        //서버로 탈퇴 요청 보내기(비밀번호 검증 및 DB 삭제)
        try {
            const token = localStorage.getItem("accessToken");

            await axios.post(
                `${import.meta.env.VITE_BACKSERVER}/member/delete`,
                { password: password, memberId: user.memberId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            //탈퇴 성공시
            Swal.fire({
                icon: "success",
                title: "안녕히 가세요 🌿",
                html: "지구를 위한 뜻깊은 여정에 함께해 주셔서 행복했습니다.<br><br>" +
                    "탈퇴 처리가 완료되었으며,<br>" +
                    "늘 회원님의 앞날에 싱그러운 일만 가득하길 응원할게요!",
                confirmButtonColor: "#2e8147",
                confirmButtonText: "그동안 감사했습니다"
            }).then(() => {
                logout();
            });

            //비밀번호 틀렸을 시
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "탈퇴 실패",
                text: err.response?.data || "비밀번호를 다시 확인해 주세요.",
                confirmButtonColor: "#e74c3c"
            });
        }
    });

    return (
        <div className={styles.wrapper}>
            <div className={styles.main_container}>
                <section>
                    <div className={styles.main_text}>
                        <div className={styles.icon_wrapper}>
                            {/* /image/closed.png 로 바로 접근 */}
                            <img src="/image/closed.png" alt="닫기 아이콘" className={styles.top_icon} />
                        </div>
                        <h1>매장 탈퇴</h1>
                        <h2>탈퇴를 진행하시겠습니까?</h2>
                        <p> <span>{user.memberName}</span> 사장님, <span>{enrollDate}</span>부터 저희와 함께해 주셔서 감사합니다.</p>
                    </div>
                </section>
                <section>
                    <div className={styles.gray_box}>
                        <div className={styles.warning_icon}>
                            <WarningIcon />
                            <span>탈퇴 전 꼭 확인해 주세요!</span>
                        </div>
                        <div className={styles.gray_box_text}>
                            <li>탈퇴 시 매장 정보, 등록된 메뉴, 그리고 정성껏 쌓아온 고객 리뷰가 모두 삭제되며 복구할 수 없습니다.</li>
                            <li>탈퇴 완료 시 매장 노출이 즉시 중단되며, 기존에 쌓인 모든 활동 데이터가 영구 삭제됩니다</li>
                            <li>현재 진행 중인 미완료 주문이 있을 경우, 처리가 완료된 후 탈퇴할 수 있습니다.</li>
                        </div>
                        <div className={styles.bold_text}>
                            <p>완전한 이별보다는, 소중한 기록을 남겨두고 잠시 쉬어가는 것을 추천해 드립니다.</p>
                        </div>
                    </div>
                    <section>
                        <div className={styles.reasonSection}>
                            <p>사장님께서 탈퇴를 결심하시게 된 가장 큰 이유는 무엇인가요? (선택)</p>
                            <div className={styles.reason_check}>
                                <label>
                                    <input type="checkbox" /> 가게 폐업 및 업종 변경
                                </label>
                                <label>
                                    <input type="checkbox" /> 앱 이용 요금(수수료/광고비 등) 부담
                                </label>
                                <label>
                                    <input type="checkbox" /> 기대보다 낮은 매출 및 주문량
                                </label>
                                <label>
                                    <input type="checkbox" /> 앱 이용 및 매장 관리의 불편함
                                </label>
                                <label>
                                    <input type="checkbox" /> 고객 응대(악성 리뷰, 클레임 등)의 어려움
                                </label>
                                <label>
                                    <input type="checkbox" /> 타 배달/포장 플랫폼 주로 이용
                                </label>
                            </div>
                        </div>
                        <section className={styles.text_input}>
                            <div className={styles.reason_input}>
                                <p>구체적인 사유를 작성해 주세요 <span>(선택)</span></p>
                                <input type="text" autoComplete="off" />
                            </div>
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* 크롬을 속이기 위한 보이지 않는 아이디 칸 (경고 없애는 용) */}
                                <input
                                    type="text"
                                    name="username"
                                    defaultValue={user?.memberId} // 현재 로그인한 유저 아이디
                                    style={{ display: "none" }}
                                    autoComplete="username"
                                />
                                <div className={styles.reason_pwInput}>
                                    <p>비밀번호</p>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="비밀번호를 입력하세요"
                                        className={styles.pwd_input}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <div className={styles.eye_icon} onClick={togglePassword}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </div>
                                </div>
                            </form>
                        </section>
                        <div className={styles.last_check_box}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                />
                                <p>안내 사항을 모두 확인 하였으며 탈퇴에 동의 합니다.</p>
                            </label>
                        </div>
                    </section>
                </section>
            </div>
            <div className={styles.two_btn}>
                <div className={styles.cancel_btn} onClick={() => window.history.back()}>
                    <p>취소</p>
                </div>
                <div className={styles.goodbye_btn}
                    onClick={handleDeleteAccount}>
                    <p>회원 탈퇴</p>
                </div>
            </div>
        </div>
    );
};

export default ManagerDelAccount;
