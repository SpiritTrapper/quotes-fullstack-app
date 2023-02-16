import {
  FC,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  Button,
  Layout,
  message,
  Modal,
  Skeleton,
  Space,
  Typography,
} from "antd";
import Avatar from "boring-avatars";
import styled from "styled-components";
import { useAuthContext } from "../contexts/AuthContext";
import { QueryResponse, QuoteValues, useHTTP } from "../hooks/useHTTP";

const AVATAR_SIZE = 80;

interface QuoteInnerType extends Partial<QuoteValues> {
  nameFetched?: boolean;
  quoteFetched?: boolean;
  isModalOpen?: boolean;
}

const quoteReducer = (
  state: QuoteInnerType,
  action: QuoteInnerType
): QuoteInnerType => {
  return action ? { ...state, ...action } : state;
};

export const Profile: FC = () => {
  const dataFetchedRef = useRef(false);
  const [userData] = useAuthContext();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, errors, queryServer, controller } = useHTTP(true);
  const [fullName, setFullName] = useState<string>();
  const [quoteState, setQuoteState] = useReducer(quoteReducer, {});

  const setErrorToasts = useCallback(() => {
    errors.forEach((error) => {
      messageApi.open({
        type: "error",
        content: error.message,
      });
    });
  }, [errors, messageApi]);

  const updateQuotes = useCallback(async () => {
    setQuoteState({
      isModalOpen: true,
      nameFetched: false,
      quoteFetched: false,
    });

    if (userData) {
      let quote;
      const author = (await queryServer(
        `${process.env.REACT_APP_SERVER_URL}/author?token=${userData.token}`,
        "GET"
      )) as QueryResponse;

      if (author && !errors.length) {
        setQuoteState({
          name: author.data.name,
          nameFetched: true,
        });
        quote = (await queryServer(
          `${process.env.REACT_APP_SERVER_URL}/quote?token=${userData.token}&authorId=${author.data.authorId}`,
          "GET"
        )) as QueryResponse;
      } else {
        setErrorToasts();
      }

      if (quote && !errors.length) {
        setQuoteState({
          quote: quote.data.quote,
          quoteFetched: true,
        });
      } else {
        setErrorToasts();
      }
    }
  }, [errors.length, queryServer, setErrorToasts, userData]);

  const handleCancel = useCallback(() => {
    setQuoteState({ isModalOpen: false });
    controller?.abort();
  }, [controller]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    if (userData) {
      queryServer(
        `${process.env.REACT_APP_SERVER_URL}/profile?token=${userData.token}`,
        "GET"
      ).then((result) => {
        if (errors.length) {
          setErrorToasts();
        } else {
          setFullName(result?.data.fullname);
        }
      });
    }
  }, [userData]);

  return (
    <Wrapper>
      {contextHolder}
      <Skeleton loading={loading} active avatar>
        <Space>
          <Avatar
            size={AVATAR_SIZE}
            variant="sunset"
            colors={["#ED2B2B", "#3d364b", "#F96167", "#FCE77D"]}
          />
          <Inner>
            <Name level={2}>Welcome, {fullName?.split(" ")[0]}!</Name>
            <Button type="primary" onClick={updateQuotes}>
              Update
            </Button>
          </Inner>
        </Space>
        {quoteState.quoteFetched && (
          <Quote>
            <QuoteText>{quoteState.quote}</QuoteText>
            <QuoteAuthor>{quoteState.name}</QuoteAuthor>
          </Quote>
        )}
      </Skeleton>
      <Modal
        open={quoteState.isModalOpen}
        onCancel={handleCancel}
        onOk={() => setQuoteState({ isModalOpen: false })}
      >
        <Typography.Title level={2}>Requesting the quote</Typography.Title>
        <Typography.Paragraph>
          Step 1: Requesting author...{" "}
          {quoteState.nameFetched ? "Completed" : ""}
        </Typography.Paragraph>
        <Typography.Paragraph>
          Step 2: Requesting quote...{" "}
          {quoteState.quoteFetched ? "Completed" : ""}
        </Typography.Paragraph>
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled(Layout.Content)`
  padding: 20px;
`;

const Inner = styled.div`
  margin-left: 15px;
`;

const Name = styled(Typography.Title)`
  color: rgba(0, 0, 0, 0.8);
  font-weight: 500;
  margin-top: 0;
`;

const Quote = styled.div`
  margin-bottom: 20px;
`;

const QuoteText = styled(Typography.Paragraph)`
  margin-top: 20px;
  font-size: 14px;
`;

const QuoteAuthor = styled(Typography.Text)`
  font-style: italic;
  text-align: right;
`;
