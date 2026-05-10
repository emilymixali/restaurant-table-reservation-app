# Restaurant Table Reservation App

Modern mobile restaurant reservation application built with React Native, Node.js, Express, and MariaDB.

## Features

- User registration and login with JWT authentication
- Browse restaurants with detailed information
- Table reservation system with available time slots
- Reservation history management
- Edit and delete future reservations
- Responsive mobile UI
- Profile and logout functionality

## Technologies Used

### Frontend
- React Native
- Expo

### Backend
- Node.js
- Express.js

### Database
- MariaDB

### Authentication
- JWT (JSON Web Token)
- bcrypt

## Installation

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=restaurant_booking
JWT_SECRET=your_secret_key
PORT=5001
```

## API Endpoints

### Authentication
- POST /register
- POST /login

### Restaurants
- GET /restaurants

### Reservations
- POST /reservations
- PUT /reservations/:id
- DELETE /reservations/:id
- GET /reservations/available

## Screenshots

Application screenshots are available inside:

```text
assets/screenshots/
```

## Author

Aimilia Michali
