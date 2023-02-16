import { FC, useCallback } from "react";
import { Button, Space, Layout, Skeleton } from "antd";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { AppRoutes } from "./App/Router";
import { useSignUpContext } from "../contexts/SignUpContext";
import { useHTTP } from "../hooks/useHTTP";

export const Header: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, , removeAuthUserData] = useAuthContext();
  const [isSignUp] = useSignUpContext();
  const { loading, errors, queryServer } = useHTTP();

  const setActiveBtn = useCallback(
    (route: AppRoutes) => {
      return location.pathname === route ? "primary" : "default";
    },
    [location.pathname]
  );

  const logOut = useCallback(async () => {
    if (userData) {
      await queryServer(
        `${process.env.REACT_APP_SERVER_URL}/logout?token=${userData.token}`,
        "DELETE"
      );

      if (!errors.length) {
        removeAuthUserData();
        navigate(AppRoutes.MAIN);
      }
    }
  }, [errors.length, navigate, queryServer, removeAuthUserData, userData]);

  return (
    <Skeleton loading={loading} paragraph={{ rows: 1 }}>
      <Layout.Header>
        <ButtonGroup wrap>
          <Button
            type={setActiveBtn(AppRoutes.MAIN)}
            onClick={() => navigate(AppRoutes.MAIN)}
          >
            About us
          </Button>
          {userData ? (
            <>
              <Button
                type={setActiveBtn(AppRoutes.PROFILE)}
                onClick={() => navigate(AppRoutes.PROFILE)}
              >
                Profile
              </Button>
              <Button
                type={setActiveBtn(AppRoutes.QUOTE)}
                onClick={() => navigate(AppRoutes.QUOTE)}
              >
                Add quote
              </Button>
              <Button type="default" onClick={logOut}>
                Log out
              </Button>
            </>
          ) : (
            <Button
              type={setActiveBtn(AppRoutes.AUTH)}
              onClick={() => navigate(AppRoutes.AUTH)}
            >
              {isSignUp ? "Sign up" : "Log in"}
            </Button>
          )}
        </ButtonGroup>
      </Layout.Header>
    </Skeleton>
  );
};

const ButtonGroup = styled(Space)`
  padding: 20px;
`;
