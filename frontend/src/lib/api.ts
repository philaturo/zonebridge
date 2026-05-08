import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const getAuthURL = () => api.get("/auth/gitea");
export const getMe = () => api.get("/api/me");

// Skills
export const getSkills = () => api.get("/api/skills");
export const getUsersBySkill = (slug: string) =>
  api.get("/api/users", { params: { slug } });
export const updateMySkills = (skills: UserSkill[]) =>
  api.put("/api/me/skills", { skills });

// Availability
export const updateAvailability = (available: boolean) =>
  api.patch("/api/me/availability", { available });

// Projects
export const getProjects = () => api.get("/api/projects");

// PostMortems
export const getPostMortems = (skill?: string) =>
  api.get("/api/postmortems", { params: { skill } });
export const createPostMortem = (data: Partial<PostMortem>) =>
  api.post("/api/postmortems", data);
export const upvotePostMortem = (id: string) =>
  api.post(`/api/postmortems/${id}/upvote`);

// Activities
export const getActivities = () => api.get("/api/activities");

export default api;
