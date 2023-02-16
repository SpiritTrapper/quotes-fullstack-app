import { FC, useCallback, useEffect, MouseEvent } from "react";
import { Form, Input, Button, message, Layout, Skeleton } from "antd";
import styled from "styled-components";
import { AuthValues, QueryResponse, useHTTP } from "../../hooks/useHTTP";
import { Hint } from "./Hint";
import { useSignUpContext } from "../../contexts/SignUpContext";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../App/Router";
import { useAuthContext } from "../../contexts/AuthContext";

type AuthRequest = Pick<AuthValues, "email" | "password" | "fullname">;
type DummyOnFinishType = (values: unknown) => void;

export const Auth: FC = () => {
  const navigate = useNavigate();
  const { loading, errors, queryServer } = useHTTP();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isSignUp, setSignUp] = useSignUpContext();
  const [, setAuthUserData] = useAuthContext();

  const handleAuth = useCallback(
    async (formValues: AuthRequest) => {
      const response = (await queryServer(
        `${process.env.REACT_APP_SERVER_URL}/${
          isSignUp ? "register" : "login"
        }`,
        "POST",
        formValues
      )) as QueryResponse;

      if (response?.success) {
        if (isSignUp) {
          messageApi.open({
            type: "success",
            content: "Successfully registered",
          });

          setSignUp(false);
        } else {
          setAuthUserData({
            token: response.data.token,
          });
          navigate(AppRoutes.PROFILE);
        }
      }
    },
    [isSignUp, messageApi, navigate, queryServer, setAuthUserData, setSignUp]
  );

  const setFormType = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      setSignUp(!isSignUp);
    },
    [isSignUp, setSignUp]
  );

  useEffect(() => {
    if (errors.length) {
      errors.forEach((error) => {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      });
    }
  }, [errors, messageApi]);

  return (
    <Skeleton loading={loading}>
      <Layout.Content>
        {contextHolder}
        <FormWrapper form={form} onFinish={handleAuth as DummyOnFinishType}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          {isSignUp ? (
            <>
              <Form.Item
                label="Full name"
                name="fullname"
                rules={[
                  { required: true, message: "Please input your full name!" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
              <Hint
                message="Already have account?"
                setFormType={setFormType}
                btnText="Log in"
              />
            </>
          ) : (
            <Hint
              message="Still don't have account?"
              setFormType={setFormType}
              btnText="Sign up"
            />
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isSignUp ? "Sign up" : "Log in"}
            </Button>
          </Form.Item>
        </FormWrapper>
      </Layout.Content>
    </Skeleton>
  );
};

const FormWrapper = styled(Form)`
  margin: 20px;
  width: 50vw;
`;
