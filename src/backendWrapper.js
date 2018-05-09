const axios = require('axios');

const get = (url, config = {}) => axios.get(url, config);
const post = (url, data, config = {}) => axios.post(url, data, config);
const put = (url, data, config = {}) => axios.put(url, data, config);

const service = {
  get, post, put
};

axios.interceptors.response.use((config) => {
  return config;
}, (error) => {
  if (error.response && error.response.status === 401) {
    window.location = '/auth/logout';
    return Promise.resolve(error);
  } else {
    return Promise.reject(error);
  }
}
);

module.exports = service;
