import { AxiosRequestHeaders } from "axios";

export default function authHeader(): AxiosRequestHeaders {
  const localstorageUser = localStorage.getItem("user");
  if (!localstorageUser) {
    return {};
  }
  const user = JSON.parse(localstorageUser);
  if (user && user.token) {
    return { Authorization: `Token ${user.token}` };
  }
  return {};
}
