# Deployment Guide - PostgreSQL with Neon

This guide will help you set up PostgreSQL using Neon and deploy your candidate management system.

## 🗄️ Database Setup with Neon

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 2. Get Database Connection String
1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

### 3. Set Up Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host/database

# Environment
NODE_ENV=production

# Server Configuration
PORT=5000
```

### 4. Initialize Database
Run the database initialization script:

```bash
cd backend
npm run init-db
```

This will:
- Create all necessary tables
- Set up constraints (including one-vote-per-user)
- Insert initial candidates
- Create indexes for performance

## 🚀 Backend Deployment

### Option 1: Railway (Recommended)
1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` directory

2. **Set Environment Variables**:
   - Add `DATABASE_URL` with your Neon connection string
   - Add `NODE_ENV=production`
   - Add `PORT=5000`

3. **Deploy**:
   - Railway will automatically detect it's a Node.js app
   - It will install dependencies and start the server

### Option 2: Heroku
1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**:
   ```bash
   heroku config:set DATABASE_URL=your_neon_connection_string
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Add PostgreSQL support"
   git push heroku main
   ```

### Option 3: Vercel
1. **Create Vercel Project**:
   - Connect your GitHub repository
   - Set the root directory to `backend`

2. **Set Environment Variables**:
   - Add `DATABASE_URL` in Vercel dashboard

3. **Deploy**:
   - Vercel will automatically deploy

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)
1. **Create Vercel Project**:
   - Connect your GitHub repository
   - Set the root directory to `my-react-app`

2. **Set Environment Variables** (if needed):
   - Add any API URLs if different from production

3. **Deploy**:
   - Vercel will automatically build and deploy

### Option 2: Netlify
1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build directory to `my-react-app`

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Deploy**:
   - Netlify will automatically deploy

## 🔧 Database Schema

The database includes the following tables:

### Candidates Table
```sql
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    party VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnp VARCHAR(5) UNIQUE NOT NULL CHECK (cnp ~ '^[0-9]{5}$'),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Votes Table (One Vote Per User)
```sql
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    cnp VARCHAR(5) NOT NULL,
    candidate_id INTEGER NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_party VARCHAR(255) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cnp), -- Ensures one vote per user
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (cnp) REFERENCES users(cnp) ON DELETE CASCADE
);
```

## 🔒 Security Features

### One Vote Per User
- **Database Constraint**: `UNIQUE(cnp)` in votes table
- **Application Check**: Server validates before inserting
- **Error Handling**: Proper error messages for duplicate votes

### Data Validation
- **CNP Format**: Must be exactly 5 digits
- **Foreign Keys**: Ensures data integrity
- **Input Sanitization**: Prevents SQL injection

## 📊 Performance Optimizations

### Database Indexes
```sql
CREATE INDEX idx_candidates_party ON candidates(party);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_votes_cnp ON votes(cnp);
```

### Connection Pooling
- PostgreSQL connection pooling for better performance
- Automatic connection management

## 🔍 Monitoring and Debugging

### Database Queries
Monitor your database performance in Neon dashboard:
- Query performance
- Connection usage
- Storage usage

### Application Logs
Check your deployment platform logs:
- Railway: Built-in logging
- Heroku: `heroku logs --tail`
- Vercel: Dashboard logs

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Check `DATABASE_URL` format
   - Ensure Neon database is active
   - Verify SSL settings

2. **Migration Errors**:
   - Run `npm run init-db` to set up schema
   - Check for existing data conflicts

3. **Voting Errors**:
   - Verify unique constraint is working
   - Check foreign key relationships

4. **Performance Issues**:
   - Monitor query performance in Neon
   - Check connection pool settings

### Environment Variables Checklist
- [ ] `DATABASE_URL` (Neon connection string)
- [ ] `NODE_ENV` (production/development)
- [ ] `PORT` (server port)

## 📈 Scaling Considerations

### Neon Free Tier Limits
- 3GB storage
- 10GB transfer per month
- Connection pooling included

### Upgrade Path
- Neon Pro: More storage and connections
- Consider read replicas for high traffic
- Implement caching for frequently accessed data

## 🔄 Backup and Recovery

### Neon Backups
- Automatic daily backups
- Point-in-time recovery
- Easy database cloning

### Data Export
```bash
# Export data from Neon
pg_dump $DATABASE_URL > backup.sql

# Import data
psql $DATABASE_URL < backup.sql
```

## 📞 Support

- **Neon Documentation**: [docs.neon.tech](https://docs.neon.tech)
- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **PostgreSQL Documentation**: [postgresql.org/docs](https://www.postgresql.org/docs)

Your application is now ready for production with a robust PostgreSQL database and proper one-vote-per-user enforcement! 