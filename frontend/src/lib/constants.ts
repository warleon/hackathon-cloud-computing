// TODO deberian ser env vars

export const URL_BASE =
  "https://z1ee016grf.execute-api.us-east-1.amazonaws.com";
const ENV = "dev";

export const ENDPOINTS = {
  LOGIN: `${URL_BASE}/${ENV}/auth/token/create/`,
  LOGOUT: `${URL_BASE}/${ENV}/auth/token/delete/`,
};
