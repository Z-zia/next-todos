import axios, { AxiosRequestConfig } from "axios";

export const customAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = axios({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};