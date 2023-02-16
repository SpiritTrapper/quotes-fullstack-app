import { FC, MouseEvent } from "react";
import { Space, Typography } from "antd";
import styled from "styled-components";

interface Props {
  message: string;
  setFormType: (event: MouseEvent) => void;
  btnText: string;
}

export const Hint: FC<Props> = ({ message, btnText, setFormType }) => (
  <Wrapper>
    <span>{message}</span>
    <Typography.Link href="" onClick={setFormType}>
      {btnText}
    </Typography.Link>
  </Wrapper>
);

const Wrapper = styled(Space)`
  margin-bottom: 20px;
`;
