# Candidate Management System

A full-stack web application for managing political candidates with real-time updates, interactive charts, and persistent data storage.

## Features

- **Real-time Updates**: Live candidate generation and updates using Socket.IO
- **Interactive Charts**: Bar and doughnut charts showing party distribution
- **CRUD Operations**: Create, read, update, and delete candidates
- **Data Persistence**: File-based storage that persists between server restarts
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Party Statistics**: Real-time party distribution and statistics

## Technology Stack

### Frontend
- React 19
- React Router for navigation
- Chart.js for interactive charts
- Socket.IO client for real-time updates
- Modern CSS with gradients and animations

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- File-based data persistence
- REST API endpoints
- CORS enabled for cross-origin requests

## Deployment

### Production Backend
The backend is deployed on Railway and available at:
```
https://mpp-exam-production-d367.up.railway.app
```

### Frontend Configuration
The frontend is configured to use the production backend by default. To switch to local development:

1. Edit `my-react-app/src/services/api.js`
2. Change the `API_BASE_URL` to `http://localhost:5000` for local development

## Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MPP-Exam
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

   This will install dependencies for:
   - Root project (concurrently for running both servers)
   - Backend (Express, Socket.IO, etc.)
   - Frontend (React, Chart.js, etc.)

## Running the Application

### Option 1: Frontend only (uses production backend)
```bash
npm run start:frontend
```

This will start only the frontend and connect to the production backend.

### Option 2: Run both servers locally (Development)
```bash
npm start
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Option 3: Run servers separately

**Backend only:**
```bash
npm run start:backend
```

**Frontend only:**
```bash
npm run start:frontend
```

### Option 4: Development mode with auto-restart
```bash
npm run dev
```

This runs both servers in development mode with auto-restart on file changes.

## Usage

1. **Open your browser** and navigate to http://localhost:3000

2. **Main Features:**
   - **Candidate List**: View all candidates with their party affiliations
   - **Add Candidate**: Click "Add New Candidate" to create a new entry
   - **Edit Candidate**: Click on any candidate to view details and edit
   - **Delete Candidate**: Remove candidates with confirmation dialog
   - **Party Charts**: Navigate to the chart view to see party distribution
   - **Live Generation**: Start/stop automatic candidate generation in the chart view

3. **Real-time Features:**
   - New candidates appear automatically when generated
   - Charts update in real-time
   - Multiple browser tabs stay synchronized
   - Data persists between server restarts

## API Endpoints

### REST API (Production: https://mpp-exam-production-d367.up.railway.app)

- `GET /api/candidates` - Get all candidates
- `GET /api/party-stats` - Get party statistics
- `GET /api/parties` - Get available parties
- `GET /api/party-colors` - Get party color mappings

### Socket.IO Events

**Client to Server:**
- `startGeneration` - Start automatic candidate generation
- `stopGeneration` - Stop automatic candidate generation
- `addCandidate` - Add a new candidate
- `updateCandidate` - Update an existing candidate
- `deleteCandidate` - Delete a candidate

**Server to Client:**
- `initialData` - Initial data when client connects
- `candidateAdded` - New candidate added
- `candidateUpdated` - Candidate updated
- `candidateDeleted` - Candidate deleted
- `generationStarted` - Generation started
- `generationStopped` - Generation stopped

## Data Persistence

The application uses file-based storage located at:
```
backend/data/candidates.json
```

This file is automatically created on first run and contains all candidate data. The data persists between server restarts.

## Project Structure

```
MPP-Exam/
├── backend/
│   ├── data/                 # Data persistence directory
│   ├── package.json          # Backend dependencies
│   └── server.js            # Express + Socket.IO server
├── my-react-app/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── App.js           # Main application component
│   └── package.json         # Frontend dependencies
├── package.json             # Root package.json with scripts
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Backend: Change port in `backend/server.js` (line 305)
   - Frontend: React will automatically suggest an alternative port

2. **Connection refused**
   - Ensure both servers are running (for local development)
   - Check that backend is on port 5000 and frontend on port 3000
   - Verify CORS settings in `backend/server.js`
   - For production, check Railway deployment status

3. **Data not persisting**
   - Check that `backend/data/` directory exists and is writable
   - Verify file permissions on `candidates.json`

4. **Socket.IO connection issues**
   - Ensure backend is running before frontend (for local development)
   - Check browser console for connection errors
   - Verify Socket.IO client version compatibility
   - For production, check Railway logs

### Development Tips

- Use browser developer tools to monitor Socket.IO events
- Check server console for real-time generation logs
- Use React Developer Tools for component debugging
- Monitor network tab for API calls and WebSocket messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 