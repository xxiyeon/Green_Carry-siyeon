import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import axios from "axios";
import { installMutationGuard } from "./utils/mutationGuard";

// router setting
import { BrowserRouter } from "react-router-dom";

installMutationGuard(axios);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Analytics />
    <SpeedInsights />
  </BrowserRouter>
);
