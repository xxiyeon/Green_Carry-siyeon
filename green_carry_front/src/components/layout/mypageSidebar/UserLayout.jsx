import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./Layout.module.css";

export default function UserLayout() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>마이페이지</h2>
        <ul>
          <li>
            <NavLink
              to="/mypage/user"
              end
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              에코포인트
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/reviews"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              리뷰관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/orderList"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              주문내역
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/profile"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              개인정보 수정
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/user/userCS"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              고객센터
            </NavLink>
          </li>
        </ul>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
