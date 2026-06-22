import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

export default function AdminLayout() {
  return (
    <div className={styles.container}>
      {/* 👈 왼쪽 고정 사이드바 */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>마이페이지</h2>
        <ul>
          <li>
            <NavLink
              to="/mypage/admin"
              end
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              대시보드
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/admin/members"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              회원 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/admin/stores"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              상점 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/admin/reviews"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              리뷰 관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/mypage/admin/containers"
              className={({ isActive }) => (isActive ? styles.activeMenu : "")}
            >
              용기 관리
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
