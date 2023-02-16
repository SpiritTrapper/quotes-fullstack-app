import { FC } from "react";
import styled from "styled-components";
import { Typography } from "antd";
import { AppRoutes } from "./App/Router";

export const NotFound: FC = () => (
  <Wrapper>
    <Inner>
      <Typography.Title level={1}>404</Typography.Title>
      <Typography.Title level={2}>Not Found</Typography.Title>
      <Typography.Paragraph>
        Try another address or go{" "}
        <Typography.Link href={AppRoutes.MAIN}>home</Typography.Link>
      </Typography.Paragraph>
    </Inner>
  </Wrapper>
);

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  background: var(--grey);
`;

const Inner = styled.div`
  margin: auto;
  text-align: center;
`;
