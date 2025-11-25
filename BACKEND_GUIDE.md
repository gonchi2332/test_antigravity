# Backend Guide: Supabase + Edge Functions

## 1. Setup Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings > API.
3. Get your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!).

## 2. Environment Variables
Create a `.env` file in the root for local development (or set in Supabase Dashboard for prod):

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

For the frontend (`.env.local`):
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_FUNCTIONS_URL=your_project_url/functions/v1/api
```

## 3. Database Schema
Run the SQL script located at `supabase/schema.sql` in the Supabase SQL Editor.
This will:
- Create `profiles` and `projects` tables.
- Enable RLS policies.
- Set up triggers for user creation and timestamps.

## 4. Deploy Edge Functions
1. Install Supabase CLI: `npm install -D supabase`
2. Login: `npx supabase login`
3. Link project: `npx supabase link --project-ref <your-project-id>`
4. Deploy functions: `npx supabase functions deploy api`

**Nota**: Las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` están disponibles automáticamente en las Edge Functions. Solo necesitas configurar secretos adicionales si tienes variables personalizadas (ej: claves de API de terceros):
```bash
npx supabase secrets set MY_CUSTOM_KEY=value
```

## 5. Usage
### Authentication
Use `src/services/auth.js` to handle login/signup.
```javascript
import { authService } from './services/auth';
await authService.signIn('user@example.com', 'password');
```

### API Calls
Use `src/services/api.js` to call your Edge Functions.
```javascript
import { apiService } from './services/api';
const projects = await apiService.get('/projects');
```

## 6. Architecture
- **Controllers**: Handle HTTP request/response (`supabase/functions/api/src/controllers`).
- **Services**: Business logic (`supabase/functions/api/src/services`).
- **Utils**: Helpers like Supabase client creation (`supabase/functions/api/src/utils`).

## 7. Security
- **RLS**: Database access is restricted by default. Policies allow users to only access their own data.
- **Edge Functions**: Validate the JWT token by creating a Supabase client with the request's Authorization header.
