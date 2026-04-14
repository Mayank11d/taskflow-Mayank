import { celebrate, Joi, Segments } from "celebrate";

export const validateRegister = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

export const validateCreateProject = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(""),
  }),
});

export const validateUpdateProject = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(""),
  }),
});

export const validateCreateTask = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(""),
    priority: Joi.string().valid("low", "medium", "high").optional(),
    assignee_id: Joi.string().uuid().optional(),
    due_date: Joi.string().isoDate().optional(),
  }),
});

export const validateUpdateTask = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional().allow(""),
    status: Joi.string().valid("todo", "in_progress", "done").optional(),
    priority: Joi.string().valid("low", "medium", "high").optional(),
    assignee_id: Joi.string().uuid().optional().allow(null),
    due_date: Joi.string().isoDate().optional().allow(null),
  }),
});
