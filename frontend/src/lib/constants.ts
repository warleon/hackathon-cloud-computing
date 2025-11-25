// TODO deberian ser env vars

export const URL_BASE =
  "https://oaoj7zgr23.execute-api.us-east-1.amazonaws.com";
const ENV = "dev";

export const ENDPOINTS = {
  LOGIN: `${URL_BASE}/${ENV}/auth/token/create/`,
  LOGOUT: `${URL_BASE}/${ENV}/auth/token/delete/`,
  USER: {
    CREATE: `${URL_BASE}/${ENV}/auth/user/create/`,
    UPDATE: `${URL_BASE}/${ENV}/auth/user/update/`,
    DELETE: `${URL_BASE}/${ENV}/auth/user/delete/`,
    GET: `${URL_BASE}/${ENV}/auth/user/get/`,
    LIST: `${URL_BASE}/${ENV}/auth/user/list/`,
  },
  INCIDENT: {
    CREATE: `${URL_BASE}/${ENV}/incident/create/`,
    UPDATE: `${URL_BASE}/${ENV}/incident/update/`,
    DELETE: `${URL_BASE}/${ENV}/incident/delete/`,
    GET: `${URL_BASE}/${ENV}/incident/get/`,
    LIST: `${URL_BASE}/${ENV}/incident/list/`,
  },
};
