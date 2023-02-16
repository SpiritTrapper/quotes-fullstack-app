import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthContext } from "../../contexts/AuthContext";
import { Main } from "../Main";
import { Auth } from "../Auth";
import { NotFound } from "../NotFound";
import { Profile } from "../Profile";
import { AddQuote } from "../AddQuote";

export const enum AppRoutes {
  MAIN = "/",
  AUTH = "/auth",
  PROFILE = "/profile",
  QUOTE = "/add-quote",
}

export const Router: FC = () => {
  const [userData] = useAuthContext();

  return (
    <Routes>
      <Route path={AppRoutes.MAIN} element={<Main />} />
      <Route
        path={AppRoutes.PROFILE}
        element={
          userData?.token ? <Profile /> : <Navigate to={AppRoutes.AUTH} />
        }
      />
      <Route
        path={AppRoutes.QUOTE}
        element={
          userData?.token ? <AddQuote /> : <Navigate to={AppRoutes.MAIN} />
        }
      />
      <Route path={AppRoutes.AUTH} element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
