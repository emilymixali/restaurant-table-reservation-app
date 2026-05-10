import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.43:5001/api', // ← βάλε τη σωστή IP του Mac σου
});

export default api;
