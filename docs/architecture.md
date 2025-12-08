# TruEstate System Architecture

## Overview

TruEstate is a retail sales management system built as a monorepo with separate backend and frontend applications.

## Architecture Diagram

```
┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend   │
│   (React)   │ <─── │  (Node.js)  │
└─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Database   │
                     └─────────────┘
```

## Components

### Backend
- RESTful API service
- Business logic and data processing
- Database management

### Frontend
- React-based user interface
- State management
- Client-side routing

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Vite
- **Database**: TBD
