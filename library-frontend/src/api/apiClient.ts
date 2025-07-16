import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/method", // your Frappe API base URL
  withCredentials: true, // important to send cookies for session
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can customize error handling here
    // For example, redirect to login on 401, or show toast
    return Promise.reject(error);
  }
);

export default apiClient;
