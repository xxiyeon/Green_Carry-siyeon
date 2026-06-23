import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

export default function ManagerLayout() {
  return (
    <div className={styles.container}>
      {/* 👈 왼쪽 고정 사이드바 */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>마이페이지</h2>
        <ul>
          <li>
            <NavLink
              to="/mypage/manager"
              end
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              상점 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/manager/menus"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              메뉴 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/manager/orders"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              주문 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/manager/reviews"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              리뷰 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/manager/profile"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              개인정보 수정
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/manager/managerCS"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              고객센터
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* 👉 오른쪽 동적 렌더링 영역 */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
