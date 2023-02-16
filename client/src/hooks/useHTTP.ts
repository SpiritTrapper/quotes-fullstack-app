import { useMemo, useState } from "react";
import AbortController from "abort-controller";

export interface AuthValues {
  email: string;
  password: string;
  fullname?: string;
}

export interface QuoteValues {
  name: string;
  quote: string;
  token: string;
}

export interface ResponseData {
  info: string;
  token: string;
  fullname: string;
  email: string;
  authorId: string;
  name: string;
  quoteId: string;
  quote: string;
}

export interface QueryResponse {
  success: boolean;
  data: Partial<ResponseData>;
}

export interface Error {
  message: string;
}

type QueryFunction = (
  url: string,
  method: "GET" | "POST" | "DELETE",
  body?: AuthValues | QuoteValues
) => Promise<QueryResponse | void>;

interface HookReturnValues {
  loading: boolean;
  queryServer: QueryFunction;
  errors: Error[];
  controller?: AbortController;
}

export const useHTTP = (isAbortable = false): HookReturnValues => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);

  const controller = useMemo(
    () => (isAbortable ? new AbortController() : undefined),
    [isAbortable]
  );

  const queryServer = async (
    url: string,
    method: "GET" | "POST" | "DELETE",
    body?: AuthValues | QuoteValues
  ): Promise<QueryResponse | void> => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method,
        signal: controller?.signal as AbortSignal,
      });
      const data = await response.json();

      if (!data.success) {
        setErrors(data.errors ?? [{ message: data.message }]);
        return;
      }

      return data;
    } catch (e) {
      setErrors([{ message: "Internal server error" }]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, errors, queryServer, controller };
};
