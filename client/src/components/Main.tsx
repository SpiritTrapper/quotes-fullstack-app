import { FC, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { QueryResponse, useHTTP } from "../hooks/useHTTP";
import { Skeleton, message, Layout } from "antd";

export const Main: FC = () => {
  const dataFetchedRef = useRef(false);
  const { loading, errors, queryServer } = useHTTP();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentInfo, setInfo] = useState<QueryResponse>();

  const setCompanyInfo = useCallback((companyInfo: QueryResponse) => {
    if (companyInfo.data) {
      setInfo(companyInfo);
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    }
  }, []);

  const setErrorToasts = useCallback(() => {
    errors.forEach((error) => {
      messageApi.open({
        type: "error",
        content: error.message,
      });
    });
  }, [errors, messageApi]);

  useEffect(() => {
    const cachedInfo = localStorage.getItem("companyInfo");
    if (cachedInfo) {
      setCompanyInfo(JSON.parse(cachedInfo));
    } else {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      queryServer(`${process.env.REACT_APP_SERVER_URL}/info`, "GET").then(
        (result) => {
          if (errors.length) {
            setErrorToasts();
          } else {
            setCompanyInfo(result as QueryResponse);
          }
        }
      );
    }
  }, []);

  return (
    <Layout.Content>
      <Wrapper>
        {contextHolder}
        <Skeleton
          loading={loading || !currentInfo?.data}
          paragraph={{ rows: 2 }}
        >
          <p
            dangerouslySetInnerHTML={{
              __html: currentInfo?.data.info as string,
            }}
          />
        </Skeleton>
      </Wrapper>
    </Layout.Content>
  );
};

const Wrapper = styled(Layout.Content)`
  padding: 20px;
`;
