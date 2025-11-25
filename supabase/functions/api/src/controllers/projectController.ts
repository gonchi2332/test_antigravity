import { Context } from "https://deno.land/x/hono@v3.0.2/mod.ts";
import { projectService } from "../services/projectService.ts";

export const projectController = {
    async getAll(c: Context) {
        try {
            const data = await projectService.getAll(c.req.raw);
            return c.json(data);
        } catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },

    async getById(c: Context) {
        try {
            const id = c.req.param("id");
            const data = await projectService.getById(c.req.raw, id);
            return c.json(data);
        } catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },

    async create(c: Context) {
        try {
            const body = await c.req.json();
            // TODO: Validate body with Zod here
            const data = await projectService.create(c.req.raw, body);
            return c.json(data, 201);
        } catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },

    async update(c: Context) {
        try {
            const id = c.req.param("id");
            const body = await c.req.json();
            const data = await projectService.update(c.req.raw, id, body);
            return c.json(data);
        } catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },

    async delete(c: Context) {
        try {
            const id = c.req.param("id");
            await projectService.delete(c.req.raw, id);
            return c.json({ success: true });
        } catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
};
