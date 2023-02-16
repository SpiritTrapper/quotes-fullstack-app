import { renderHook } from "@testing-library/react-hooks";
import { useHTTP } from "./useHTTP";

describe("useHTTP", () => {
  const mockErrorResponse = {
    success: false,
    message: "Internal server error",
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should fetch data successfully", async () => {
    const mockResponse = {
      success: true,
      data: { info: "Some information about the company." },
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const { result, waitForNextUpdate } = renderHook(() => useHTTP());

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toHaveLength(0);

    result.current.queryServer("/info", "GET");

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.controller).toBeUndefined();
  });

  it("should handle error", async () => {
    const mockResponse = {
      success: false,
      errors: [{ message: "Invalid token" }],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const { result, waitForNextUpdate } = renderHook(() => useHTTP());

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toHaveLength(0);

    result.current.queryServer("/profile?token=invalid_token", "GET");

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toBe("Invalid token");
    expect(result.current.controller).toBeUndefined();
  });

  it("should set errors when a GET request to /author returns an error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockErrorResponse),
    });

    const { result, waitForNextUpdate } = renderHook(() => useHTTP());

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toEqual([]);

    result.current.queryServer("/author?token=123", "GET");

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toEqual([
      { message: "Internal server error" },
    ]);
    expect(result.current.controller).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("/author?token=123", {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });
  });

  it("should handle an invalid JSON response from the server", async () => {
    const invalidJson = "this is not valid JSON";
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.reject(),
      text: () => Promise.resolve(invalidJson),
      ok: true,
    });

    const { result, waitForNextUpdate } = renderHook(() => useHTTP());
    const promise = result.current.queryServer("/info", "GET");

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.errors).toEqual([
      { message: "Internal server error" },
    ]);
    expect(result.current.loading).toBe(false);
    const response = await promise;
    expect(response).toBeUndefined();
  });
});
