const PROD_API_BASE_URL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';
const DEV_API_BASE_URL = 'http://127.0.0.1:5001/corota-fe133/us-central1/api';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL);
