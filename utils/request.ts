import axios from "axios";

const $http = axios.create({
  maxRedirects: 5,
  withCredentials: true,
});

export default $http;
