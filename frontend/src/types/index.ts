export interface User {
  id: string;
  gitea_id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  cohort: string;
  role: string;
  available: boolean;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  created_at: string;
}

export interface UserSkill {
  skill_id: string;
  proficiency: "beginner" | "intermediate" | "expert";
}

export interface Project {
  id: string;
  edu01_id: string | null;
  name: string;
  slug: string;
  module: string;
  branch: string;
  description: string;
  difficulty: number;
  xp_reward: number;
  status: string;
  created_at: string;
}

export interface PostMortem {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  gitea_repo: string;
  challenge: string;
  solution: string;
  regret: string;
  tags: string[];
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_mortem_id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface HelpRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_avatar_url?: string;
  skill_id: string;
  skill_name: string;
  project_id: string | null;
  project_name: string | null;
  title: string;
  description: string;
  status: "open" | "accepted" | "resolved";
  helper_id: string | null;
  helper_name: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface Activity {
  id: string;
  type:
    | "USER_AVAILABLE"
    | "NEW_POSTMORTEM"
    | "HELP_REQUEST"
    | "USER_ONLINE"
    | "USER_OFFLINE";
  user_id: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface AuthResponse {
  token: string;
}
