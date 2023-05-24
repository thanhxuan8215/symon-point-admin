import { Spin } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts";
import "./style.scss";

const LoginPage = React.lazy(() => import("../pages/login"));
const PointHistoryPage = React.lazy(() => import("../pages/point-history"));
const TranisactionHistoryPage = React.lazy(
  () => import("../pages/transaction-history")
);
const StatisticalPage = React.lazy(() => import("../pages/statistical"));
const NotFoundPage = React.lazy(() => import("../pages/not-found"));

type AppState = { checking: boolean; authorized?: boolean };
export function MainRoutes() {
  const [state, setState] = useState<AppState>({
    checking: true,
    authorized: false,
  });

  const checkLogin = () => {
    const authorized = document.cookie === "" ? false : true;
    setState({ checking: false, authorized });
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (state.checking) {
    return (
      <div className="loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Fragment>
      {state.authorized ? <AuthorizedRoutes /> : <UnauthorizedRoutes />}
    </Fragment>
  );
}

function UnauthorizedRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export function AuthorizedRoutes() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="loading">
            <Spin size="large" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/points-history" />}></Route>
          <Route path="/login" element={<Navigate to="/points-history" />}></Route>
          <Route path="/points-history" element={<PointHistoryPage />} />
          <Route
            path="/transaction-history"
            element={<TranisactionHistoryPage />}
          />
          <Route path="/statistical" element={<StatisticalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
