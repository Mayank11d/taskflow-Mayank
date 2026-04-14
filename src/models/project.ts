import { TaskModel } from "./task";

export interface ProjectModel {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  created_at: Date;
}

export interface ProjectWithTasks extends ProjectModel {
  tasks: TaskModel[];
}
