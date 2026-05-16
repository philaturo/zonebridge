import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

// Comments
export const getComments = (postMortemId: string) =>
  api.get(`/api/postmortems/${postMortemId}/comments`);
export const createComment = (
  postMortemId: string,
  data: { content: string },
) => api.post(`/api/postmortems/${postMortemId}/comments`, data);

// Help Requests
export const getHelpRequests = (status?: string) =>
  api.get("/api/help-requests", { params: status ? { status } : undefined });
export const createHelpRequest = (data: {
  skill_id: string;
  skill_name: string;
  project_id?: string;
  project_name?: string;
  title: string;
  description: string;
}) => api.post("/api/help-requests", data);
export const acceptHelpRequest = (id: string) =>
  api.patch(`/api/help-requests/${id}/accept`);
export const resolveHelpRequest = (id: string) =>
  api.patch(`/api/help-requests/${id}/resolve`);

// Users
export const getAllUsers = () => api.get("/api/users");
export const getAvailableUsers = () => api.get("/api/users/online");

// Activities
export const getActivities = () => api.get("/api/activities");

export default api;
