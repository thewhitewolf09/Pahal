import axios from "axios";

const api = axios.create({
  //baseURL: 'http://192.168.143.165:8080',
  baseURL: "https://pahal-blond.vercel.app",
});

export default api;