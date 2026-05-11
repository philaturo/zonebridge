import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CRITICAL: sends cookies with every request
});

// NO localStorage token logic needed anymore

// Auth
export const getAuthURL = () => api.get("/auth/gitea");
export const getMe = () => api.get("/api/me");
export const logout = () => api.post("/auth/logout");

// Skills
export const getSkills = () => api.get("/api/skills");
export const getUsersBySkill = (slug: string) =>
  api.get("/api/users", { params: { slug } });
export const updateMySkills = (skills: any[]) =>
  api.put("/api/me/skills", { skills });
export const createSkill = (data: { name: string; category?: string }) =>
  api.post("/api/skills", data);

// Availability
export const updateAvailability = (available: boolean) =>
  api.patch("/api/me/availability", { available });

// Projects
export const getProjects = () => api.get("/api/projects");

// PostMortems
export const getPostMortems = (skill?: string) =>
  api.get("/api/postmortems", { params: { skill } });
export const createPostMortem = (data: any) =>
  api.post("/api/postmortems", data);
export const getMyPostMortems = () => api.get("/api/me/postmortems");
export const upvotePostMortem = (id: string) =>
  api.post(`/api/postmortems/${id}/upvote`);

// Activities
export const getActivities = () => api.get("/api/activities");

export default api;
