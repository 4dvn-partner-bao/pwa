import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import CheckIn from "./pages/CheckIn.jsx";
import SessionPage from "./pages/Session.jsx";
import Checkout from "./pages/Checkout.jsx";
import Receipt from "./pages/Receipt.jsx";
import "./index.css";
import Profile from "./pages/Profile.jsx";
import History from "./pages/History.jsx";
import PWA from "./pages/PWA.jsx";
import Map from "./pages/Map.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "checkin", element: <CheckIn /> },
      { path: "session", element: <SessionPage /> },
      { path: "checkout", element: <Checkout /> },
      { path: "receipt", element: <Receipt /> },
      { path: "profile", element: <Profile /> },
      { path: "history", element: <History /> }, // ⬅️ lịch sử
      { path: "pwa", element: <PWA /> }, // ⬅️ lịch sử
      { path: "map", element: <Map /> }, // ⬅️ lịch sử
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
