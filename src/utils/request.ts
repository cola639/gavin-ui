import { Modal } from 'antd-mobile';
import axios from 'axios';
import { toast } from 'react-toastify';
import { logoutUser } from 'store/slice/userReducer';
import { getToken } from './auth';

const isReLogin = {
  show: false
};

// create an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30 * 1000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent

    // let each request carry token
    // please modify it according to the actual situation
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken();
    }

    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;

    // if the custom code is not 200, it is judged as an error.
    if (res.code !== 200) {
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 401) {
        // to re login
        if (!isReLogin.show) {
          isReLogin.show = true;
          Modal.alert({
            content: 'Account login timeout requires re login',
            onConfirm: () => {
              logoutUser();
            }
          });
        }
      }
      if (res.code === 500) {
        toast.error(res.msg || 'Error', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored'
        });
      }

      return Promise.reject(new Error(res.msg || 'Error'));
    } else {
      return response.data;
    }
  },
  (error) => {
    console.error('error ' + error);
    return Promise.reject(error);
  }
);

export default service;
