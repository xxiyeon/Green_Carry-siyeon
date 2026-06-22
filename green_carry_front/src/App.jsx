import "./App.css";
import Header from "./components/commons/Header";
import Footer from "./components/commons/Footer";
import MetaTag from "./components/commons/MetaTag";
import { Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/main/Home";
import StoreView from "./pages/main/StoreView";
import StoreDetail from "./pages/main/StoreDetail";
import NotFound from "./pages/error/NotFound";

import OrderPage from "./pages/order/OrderPage";
import PaymentPage from "./pages/order/PaymentPage";
import CheckoutPage from "./pages/order/CheckoutPage";

import Login from "./pages/login/Login";
import Account from "./pages/login/FindAccount";
import UserLayout from "./components/layout/mypageSidebar/UserLayout";
import ManagerLayout from "./components/layout/mypageSidebar/ManagerLayout";
import AdminLayout from "./components/layout/mypageSidebar/AdminLayout";
import UserProfile from "./pages/mypage/user/UserProfile";
import UserInfoEdit from "./pages/mypage/user/UserInfoEdit";
import UserDelAccount from "./pages/mypage/deleteMember/UserDelAccount";

import { AuthProvider } from "./context/AuthContext";
import UserSignup from "./pages/signup/UserSignup";
import ManagerSignup from "./pages/signup/ManagerSignup";
import Signup from "./pages/signup/Signup";
import UserCS from "./pages/mypage/user/UserCS";

import ManagerInfoEdit from "./pages/mypage/manager/ManagerInfoEdit";
import ManagerMenuList from "./pages/mypage/manager/ManagerMenuList";
import ManagerMenuEdit from "./pages/mypage/manager/ManagerMenuEdit";

import AdminDashboard from "./pages/mypage/admin/AdminDashboard";
import AdminUserManagement from "./pages/mypage/admin/AdminUserManagement";
import AdminStoreManagement from "./pages/mypage/admin/AdminStoreManagement";
import AdminReviewManagement from "./pages/mypage/admin/AdminReviewManagement";
import AdminContainerManagement from "./pages/mypage/admin/AdminContainerManagement";

import ProtectedRoute from "./context/ProtectedRoute";
import ManagerDelAccount from "./pages/mypage/deleteMember/ManagerDelAccount";
import UserOrderList from "./pages/mypage/user/UserOrderList";

import ManagerDashboard from "./pages/mypage/manager/ManagerDashBoard";

import UserReviewList from "./pages/mypage/user/UserReviewList";
import ManagerReviewComment from "./pages/mypage/manager/ManagerReviewComment";
import ManagerOrderList from "./pages/mypage/manager/ManagerOrderList";
import ManagerCS from "./pages/mypage/manager/ManagerCS";
import AdminStoreManagementDetail from "./pages/mypage/admin/AdminStoreManagementDetail";
import StoreReviewPage from "./pages/main/StoreReviewPage";
import AdminContainerList from "./pages/mypage/admin/AdminContainerList";
import ScrollToTop from "./components/commons/ScrollToTop";

const BasicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

const withMeta = (element, title, description) => (
  <>
    <MetaTag title={title} description={description} />
    {element}
  </>
);

function App() {
  return (
    <AuthProvider>
      <div>
        <ScrollToTop />
        <Routes>
          <Route element={<ProtectedRoute requireGuest={true} />}>
            <Route
              path="/login"
              element={withMeta(
                <Login />,
                "로그인",
                "그린캐리 계정으로 로그인하고 다회용기 배달 서비스를 이용해보세요.",
              )}
            />
            <Route
              path="/account"
              element={withMeta(
                <Account />,
                "계정 찾기",
                "그린캐리 계정 정보를 확인하고 로그인 정보를 찾아보세요.",
              )}
            />
            <Route
              path="/signup"
              element={withMeta(
                <Signup />,
                "회원가입",
                "그린캐리 회원가입 유형을 선택하고 서비스를 시작해보세요.",
              )}
            />
            <Route
              path="/userSignup"
              element={withMeta(
                <UserSignup />,
                "개인 회원가입",
                "그린캐리 개인 회원으로 가입하고 친환경 배달 서비스를 이용해보세요.",
              )}
            />
            <Route
              path="/managerSignup"
              element={withMeta(
                <ManagerSignup />,
                "점주 회원가입",
                "그린캐리 점주 회원으로 가입하고 매장 운영을 시작해보세요.",
              )}
            />
          </Route>

          <Route element={<BasicLayout />}>
            <Route
              path="/"
              element={withMeta(
                <Home />,
                "홈",
                "그린캐리에서 친환경 다회용기 배달 매장과 서비스를 만나보세요.",
              )}
            />
            <Route
              path="/storeView/:id"
              element={withMeta(
                <StoreView />,
                "매장 목록",
                "그린캐리에서 다회용기 배달이 가능한 매장을 찾아보세요.",
              )}
            />
            <Route
              path="/storeDetail/:id"
              element={withMeta(
                <StoreDetail />,
                "매장 상세",
                "매장 정보와 메뉴를 확인하고 친환경 배달을 주문해보세요.",
              )}
            />
            <Route
              path="/storeReviews/:id"
              element={withMeta(
                <StoreReviewPage />,
                "매장 리뷰",
                "그린캐리 이용자들의 매장 리뷰와 평점을 확인해보세요.",
              )}
            />

            <Route element={<ProtectedRoute requireUser={true} />}>
              <Route
                path="/orderPage"
                element={withMeta(
                  <OrderPage />,
                  "주문하기",
                  "장바구니를 확인하고 친환경 배달 주문을 진행하세요.",
                )}
              />
              <Route
                path="/paymentPage"
                element={withMeta(
                  <PaymentPage />,
                  "결제하기",
                  "그린캐리 주문 결제를 안전하게 진행하세요.",
                )}
              />
              <Route
                path="/checkoutPage"
                element={withMeta(
                  <CheckoutPage />,
                  "주문 완료",
                  "그린캐리 주문 완료 내역과 결제 결과를 확인하세요.",
                )}
              />

              <Route path="/mypage/user" element={<UserLayout />}>
                <Route
                  index
                  element={withMeta(
                    <UserProfile />,
                    "마이페이지",
                    "내 정보와 최근 활동을 그린캐리 마이페이지에서 확인하세요.",
                  )}
                />
                <Route
                  path="reviews"
                  element={withMeta(
                    <UserReviewList />,
                    "내 리뷰",
                    "작성한 리뷰와 평점을 한눈에 확인하세요.",
                  )}
                />
                <Route
                  path="profile"
                  element={withMeta(
                    <UserInfoEdit />,
                    "회원정보 수정",
                    "그린캐리 회원 정보를 수정하고 계정을 관리하세요.",
                  )}
                />
                <Route
                  path="userCS"
                  element={withMeta(
                    <UserCS />,
                    "고객센터",
                    "자주 묻는 질문과 문의 내역을 확인해보세요.",
                  )}
                />
                <Route
                  path="orderList"
                  element={withMeta(
                    <UserOrderList />,
                    "주문 내역",
                    "그린캐리 주문 내역과 주문 상태를 확인하세요.",
                  )}
                />
                <Route
                  path="deleteMember"
                  element={withMeta(
                    <UserDelAccount />,
                    "회원 탈퇴",
                    "그린캐리 계정 탈퇴를 진행하는 페이지입니다.",
                  )}
                />
              </Route>
            </Route>

            <Route element={<ProtectedRoute requireManager={true} />}>
              <Route path="/mypage/manager" element={<ManagerLayout />}>
                <Route
                  index
                  element={withMeta(
                    <ManagerDashboard />,
                    "점주 대시보드",
                    "점주 대시보드에서 매장 운영 현황을 한눈에 확인하세요.",
                  )}
                />
                <Route
                  path="profile"
                  element={withMeta(
                    <ManagerInfoEdit />,
                    "점주 정보 수정",
                    "점주 계정과 매장 정보를 수정하세요.",
                  )}
                />
                <Route
                  path="menus"
                  element={withMeta(
                    <ManagerMenuList />,
                    "메뉴 관리",
                    "매장 메뉴를 등록하고 수정해보세요.",
                  )}
                />
                <Route
                  path="menus/menuEdit/:storeId/:menuId?"
                  element={withMeta(
                    <ManagerMenuEdit />,
                    "메뉴 편집",
                    "매장 메뉴 정보를 추가하거나 수정하세요.",
                  )}
                />
                <Route
                  path="deleteMember"
                  element={withMeta(
                    <ManagerDelAccount />,
                    "점주 탈퇴",
                    "점주 계정 탈퇴를 진행하는 페이지입니다.",
                  )}
                />
                <Route
                  path="reviews"
                  element={withMeta(
                    <ManagerReviewComment />,
                    "리뷰 관리",
                    "고객 리뷰를 확인하고 답글을 관리하세요.",
                  )}
                />
                <Route
                  path="orders"
                  element={withMeta(
                    <ManagerOrderList />,
                    "주문 관리",
                    "매장 주문 내역과 처리 상태를 관리하세요.",
                  )}
                />
                <Route
                  path="managerCS"
                  element={withMeta(
                    <ManagerCS />,
                    "점주 고객센터",
                    "점주용 문의와 안내를 확인하세요.",
                  )}
                />
              </Route>
            </Route>

            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/mypage/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={withMeta(
                    <AdminDashboard />,
                    "관리자 대시보드",
                    "관리자 대시보드에서 서비스 현황을 확인하세요.",
                  )}
                />
                <Route
                  path="members"
                  element={withMeta(
                    <AdminUserManagement />,
                    "회원 관리",
                    "그린캐리 회원 정보를 조회하고 관리하세요.",
                  )}
                />
                <Route
                  path="stores"
                  element={withMeta(
                    <AdminStoreManagement />,
                    "매장 관리",
                    "등록된 매장 정보를 조회하고 관리하세요.",
                  )}
                />
                <Route
                  path="stores/detail/:storeId"
                  element={withMeta(
                    <AdminStoreManagementDetail />,
                    "매장 상세 관리",
                    "매장 상세 정보와 상태를 관리하세요.",
                  )}
                />
                <Route
                  path="reviews"
                  element={withMeta(
                    <AdminReviewManagement />,
                    "리뷰 관리",
                    "서비스 리뷰를 조회하고 관리하세요.",
                  )}
                />
                <Route
                  path="containers"
                  element={withMeta(
                    <AdminContainerList />,
                    "용기 관리",
                    "다회용기 목록과 정보를 관리하세요.",
                  )}
                />
                <Route
                  path="containers/detail/:productId"
                  element={withMeta(
                    <AdminContainerManagement />,
                    "용기 상세 관리",
                    "다회용기 상세 정보를 수정하고 관리하세요.",
                  )}
                />
              </Route>
            </Route>
          </Route>

          <Route
            path="*"
            element={withMeta(
              <NotFound />,
              "페이지를 찾을 수 없음",
              "요청하신 페이지를 찾을 수 없습니다. 그린캐리 홈으로 이동해보세요.",
            )}
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
