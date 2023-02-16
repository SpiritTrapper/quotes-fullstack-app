import React, {
  createContext,
  Dispatch,
  FC,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";

type SignUpContextValue = [boolean, Dispatch<SetStateAction<boolean>>];

export const SignUpContext = createContext<SignUpContextValue>([
  false,
  (): never => {
    throw new Error("Must initialize SignUpProvider value");
  },
]);

export const useSignUpContext = (): SignUpContextValue =>
  useContext(SignUpContext);

export const SignUpContextProvider: FC<{
  children: ReactElement | ReactElement[];
}> = ({ children }) => {
  const [isSignUp, setSignUp] = useState<boolean>(false);

  return (
    <SignUpContext.Provider value={[isSignUp, setSignUp]}>
      {children}
    </SignUpContext.Provider>
  );
};
