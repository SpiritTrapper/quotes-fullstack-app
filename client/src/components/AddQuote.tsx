import { FC, useCallback, useEffect } from "react";
import { Button, Form, Input, message } from "antd";
import styled from "styled-components";
import { QueryResponse, QuoteValues, useHTTP } from "../hooks/useHTTP";
import { useAuthContext } from "../contexts/AuthContext";

type DummyOnFinishType = (values: unknown) => void;

export const AddQuote: FC = () => {
  const { errors, queryServer } = useHTTP();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [userData] = useAuthContext();

  const handleAuthorAdd = useCallback(
    async (formValues: QuoteValues) => {
      if (userData) {
        const response = (await queryServer(
          `${process.env.REACT_APP_SERVER_URL}/create`,
          "POST",
          {
            ...formValues,
            token: userData.token as string,
          }
        )) as QueryResponse;

        if (response?.success) {
          messageApi.open({
            type: "success",
            content: "Quote successfully added",
          });
        }
      }
    },
    [messageApi, queryServer, userData]
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
    <>
      {contextHolder}
      <FormWrapper form={form} onFinish={handleAuthorAdd as DummyOnFinishType}>
        <Form.Item
          label="New quote"
          name="quote"
          rules={[{ required: true, message: "Please input quote!" }]}
        >
          <Input type="text" placeholder="Enter quote" />
        </Form.Item>

        <Form.Item
          label="Author name"
          name="name"
          rules={[{ required: true, message: "Please input author name!" }]}
        >
          <Input type="text" placeholder="Enter author name" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add quote
          </Button>
        </Form.Item>
      </FormWrapper>
    </>
  );
};

const FormWrapper = styled(Form)`
  margin: 20px;
  width: 50vw;
`;
