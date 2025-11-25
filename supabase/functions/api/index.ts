import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.0.2/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.0.2/middleware.ts";
import { projectController } from "./src/controllers/projectController.ts";

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) => c.text("Supabase Edge Function API is running!"));

// Project Routes
app.get("/projects", projectController.getAll);
app.get("/projects/:id", projectController.getById);
app.post("/projects", projectController.create);
app.put("/projects/:id", projectController.update);
app.delete("/projects/:id", projectController.delete);

serve(app.fetch);
