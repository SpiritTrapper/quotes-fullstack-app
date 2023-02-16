import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  
  body {
    position: relative;
    font-family: var(--roboto);
    font-size: 14px;
    font-weight: 400;
    --roboto: 'Roboto', sans-serif;
    
    background: var(--white);
    color: var(--black);
    --black: #0B0B0B;
    --white: #ffffff;
    --grey: #f5f5f5;
  }
`;
