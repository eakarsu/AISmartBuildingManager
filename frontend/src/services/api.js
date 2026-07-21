import { apiDelete, apiGet, apiPost, apiPut } from '../api.js';

// Compatibility adapter for pages that use an axios-shaped client. Keeping the
// transport in one place preserves the existing token and error handling.
const wrap = (request) => request.then((data) => ({ data }));

const api = {
  get: (path) => wrap(apiGet(path)),
  post: (path, body) => wrap(apiPost(path, body)),
  put: (path, body) => wrap(apiPut(path, body)),
  delete: (path) => wrap(apiDelete(path)),
};

export default api;
