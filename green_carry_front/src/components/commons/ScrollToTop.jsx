import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // 부드럽게 하고 싶으면 "smooth"
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;