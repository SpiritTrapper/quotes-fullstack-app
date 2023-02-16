import { FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppView } from "./AppView";
import { Router } from "./Router";
import { GlobalStyles } from "./GlobalStyles";

export const App: FC = () => (
  <BrowserRouter>
    <GlobalStyles />
    <AppView>
      <Router />
    </AppView>
  </BrowserRouter>
);
