import React, {
  createContext,
  FC,
  ReactElement,
  useCallback,
  useContext,
  useState,
} from "react";

export interface AuthData {
  email?: string;
  password?: string;
  token?: string;
}

type AuthContext = [
  AuthData | undefined,
  (userData: AuthData) => void,
  () => void
];

export const USER_DATA_STORAGE_NAME = "userData";

const cachedData = localStorage.getItem(USER_DATA_STORAGE_NAME);
const initialValues = cachedData ? JSON.parse(cachedData) : undefined;

const setFallbackError = (): never => {
  throw new Error("Must initialize AuthProvider value");
};

export const AuthContextBody = createContext<AuthContext>([
  initialValues,
  setFallbackError,
  setFallbackError,
]);

export const useAuthContext = (): AuthContext => useContext(AuthContextBody);

export const AuthContextProvider: FC<{
  children: ReactElement | ReactElement[];
}> = ({ children }) => {
  const [userData, setUserData] = useState<AuthData | undefined>(initialValues);

  const setAuthUserData = useCallback((userData: AuthData) => {
    localStorage.setItem(USER_DATA_STORAGE_NAME, JSON.stringify(userData));
    setUserData(userData);
  }, []);

  const removeAuthUserData = useCallback(() => {
    localStorage.removeItem(USER_DATA_STORAGE_NAME);
    setUserData(undefined);
  }, []);

  return (
    <AuthContextBody.Provider
      value={[userData, setAuthUserData, removeAuthUserData]}
    >
      {children}
    </AuthContextBody.Provider>
  );
};
