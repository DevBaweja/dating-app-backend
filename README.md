# Bumble Dating App Backend

A Node.js backend server with MongoDB database for the Bumble-like dating application.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Profile Management**: Create, update, and manage user profiles
- **Matching System**: Like, super like, and pass on profiles with 4-match limit
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **RESTful API**: Clean API endpoints for all functionality

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd bumble-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory with:
   ```env
   MONGODB_URI=mongodb+srv://devbaweja576:cVnRyyo9oONo6Xn5@bumble.wiowvrq.mongodb.net/bumble-dating-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Profiles

#### Get All Profiles (for swiping)
```
GET /api/profiles
Authorization: Bearer <token>
```

#### Get Specific Profile
```
GET /api/profiles/:id
Authorization: Bearer <token>
```

#### Create Profile
```
POST /api/profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "age": 25,
  "bio": "Love hiking and coffee!",
  "photo": "https://example.com/photo.jpg",
  "interests": ["Hiking", "Coffee", "Travel"],
  "lookingFor": "Someone adventurous",
  "hobbies": ["Weekend camping", "Coffee brewing"],
  "job": "Software Engineer",
  "education": "Computer Science",
  "location": "San Francisco"
}
```

#### Update Profile
```
PUT /api/profiles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio"
}
```

#### Seed Profiles (Development)
```
POST /api/profiles/seed
```
Populates the database with sample profiles.

### Matches

#### Get User's Matches
```
GET /api/matches
Authorization: Bearer <token>
```

#### Like a Profile
```
POST /api/matches/like/:profileId
Authorization: Bearer <token>
Content-Type: application/json

{
  "superLiked": false
}
```

#### Super Like a Profile
```
POST /api/matches/superlike/:profileId
Authorization: Bearer <token>
```

#### Pass on a Profile
```
POST /api/matches/pass/:profileId
Authorization: Bearer <token>
```

#### Get Liked Profiles
```
GET /api/matches/liked
Authorization: Bearer <token>
```

#### Remove Match
```
DELETE /api/matches/:profileId
Authorization: Bearer <token>
```

#### Get Match Statistics
```
GET /api/matches/stats
Authorization: Bearer <token>
```

### User Management

#### Get Current User
```
GET /api/users/me
Authorization: Bearer <token>
```

#### Update User
```
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

#### Change Password
```
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Delete Account
```
DELETE /api/users/me
Authorization: Bearer <token>
```

## Database Models

### User Model
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `profileId` (ObjectId, ref: Profile)
- `matches` (Array of match objects)
- `likedProfiles` (Array of liked profile objects)
- `isActive` (Boolean, default: true)

### Profile Model
- `name` (String, required)
- `age` (Number, required, 18-100)
- `bio` (String, required, max 500 chars)
- `photo` (String, required)
- `interests` (Array of strings)
- `lookingFor` (String, required, max 200 chars)
- `hobbies` (Array of strings)
- `job` (String, required)
- `education` (String, required)
- `location` (String, default: "Unknown")
- `isActive` (Boolean, default: true)

## Features

### Authentication & Security
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Token expiration (7 days)

### Matching System
- Like profiles (regular like)
- Super like profiles (automatic match)
- Pass on profiles
- Maximum 4 matches per user
- Track liked profiles separately

### Profile Management
- Create detailed profiles with interests and hobbies
- Update profile information
- Profile validation and constraints
- Location tracking

### Data Persistence
- MongoDB Atlas cloud database
- Mongoose schemas with validation
- Indexed queries for performance
- Timestamps for all records

## Error Handling

The API includes comprehensive error handling:
- Validation errors for invalid data
- Authentication errors for unauthorized access
- Database errors with meaningful messages
- Rate limiting considerations

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

## Next Steps

1. **Connect Frontend**: Update the React frontend to use these API endpoints
2. **Add Real-time Features**: Implement WebSocket for real-time messaging
3. **Image Upload**: Add image upload functionality for profile photos
4. **Push Notifications**: Implement push notifications for matches
5. **Advanced Matching**: Add algorithm-based matching
6. **Testing**: Add comprehensive test suite
7. **Deployment**: Deploy to cloud platform (Heroku, AWS, etc.)

## License

ISC 