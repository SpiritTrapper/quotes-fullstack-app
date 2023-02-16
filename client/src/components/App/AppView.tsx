import { FC, ReactElement } from "react";
import styled from "styled-components";
import { AuthContextProvider } from "../../contexts/AuthContext";
import { Header } from "../Header";
import { SignUpContextProvider } from "../../contexts/SignUpContext";

interface Props {
  children: ReactElement;
}

export const AppView: FC<Props> = ({ children }) => (
  <Wrapper>
    <AuthContextProvider>
      <SignUpContextProvider>
        <Header />
        {children}
      </SignUpContextProvider>
    </AuthContextProvider>
  </Wrapper>
);

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  background-color: var(--grey);
`;
