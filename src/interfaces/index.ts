export interface JwtPayload {
  user_id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface TaskFilters {
  status?: string;
  assignee?: string;
}

export interface ServiceError {
  statusCode: number;
  message: string;
  fields?: Record<string, string>;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
