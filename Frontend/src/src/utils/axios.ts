import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/users/get_user_data',
    login: '/api/users/login',
    register: '/api/users/register',
    authenticate: '/api/users/authenticate'
  },
  scholarship: {
    all: '/api/scholarships/get_all',
    new_scholarship: '/api/scholarships/open_new',
    get_scholarship: '/api/scholarships/get_scholarship',
    edit_scholarship: '/api/scholarships/edit',
    delete: 'api/scholarships/delete',
  },
  applications: {
    get_all: '/api/applications/get_all',

  },

};
