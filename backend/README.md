# Journal Backend API

Backend API for the private journal application.

## Deployment to Railway

### Prerequisites
1. Create a [Railway](https://railway.app) account
2. Install Railway CLI: `npm install -g @railway/cli`

### Deploy Steps

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Initialize Railway project:**
   ```bash
   cd backend
   railway init
   ```

3. **Add PostgreSQL database:**
   ```bash
   railway add --database postgresql
   ```

4. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=<generate-strong-random-secret-32-chars>
   railway variables set ALLOWED_ORIGINS=https://adamcarrillo.xyz
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Run database migrations:**
   ```bash
   railway run bash -c "psql \$DATABASE_URL -f migrations/001_initial_schema.sql"
   ```

7. **Get your backend URL:**
   ```bash
   railway domain
   ```

### Environment Variables

Required environment variables for production:

- `NODE_ENV=production`
- `JWT_SECRET=<your-secret-key>` (generate a strong random 32+ character string)
- `DATABASE_URL` (automatically set by Railway PostgreSQL)
- `ALLOWED_ORIGINS=https://adamcarrillo.xyz` (your frontend domain)
- `PORT` (automatically set by Railway)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start PostgreSQL with Docker:
   ```bash
   docker-compose up -d
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Journal Entries (requires JWT)
- `GET /api/entries` - Get all entries (with pagination, search, filters)
- `GET /api/entries/:id` - Get single entry
- `POST /api/entries` - Create entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Tags (requires JWT)
- `GET /api/tags` - Get all tags with counts
