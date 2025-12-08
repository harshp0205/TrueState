# Deployment Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

TBD - Production deployment instructions will be added later.

## Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - Database connection string

### Frontend
- `VITE_API_URL` - Backend API URL
