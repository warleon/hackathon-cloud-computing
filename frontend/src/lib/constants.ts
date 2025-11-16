// TODO deberian ser env vars

export const URL_BASE =
  "https://z1ee016grf.execute-api.us-east-1.amazonaws.com";
const ENV = "dev";

export const ENDPOINTS = {
  LOGIN: { url: `${URL_BASE}/${ENV}/auth/token/create/`, method: "POST" },
  LOGOUT: { url: `${URL_BASE}/${ENV}/auth/token/delete/`, method: "POST" },
  USER: {
    CREATE: { url: `${URL_BASE}/${ENV}/auth/user/create`, method: "POST" },
    UPDATE: { url: `${URL_BASE}/${ENV}/auth/user/update`, method: "POST" },
    DELETE: { url: `${URL_BASE}/${ENV}/auth/user/delte`, method: "POST" },
    GET: { url: `${URL_BASE}/${ENV}/auth/user/get`, method: "POST" },
    LIST: { url: `${URL_BASE}/${ENV}/auth/user/list`, method: "POST" },
  },
};
