import { useEffect } from "react";

const DEFAULT_TITLE = "그린캐리 - 친환경 용기 배달";
const DEFAULT_DESCRIPTION = "지구를 살리는 다회용기 배달 서비스";

const MetaTag = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | 그린캐리` : DEFAULT_TITLE;

    let metaDescription = document.querySelector('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      "content",
      description || DEFAULT_DESCRIPTION,
    );
  }, [title, description]);

  return null;
};

export default MetaTag;
