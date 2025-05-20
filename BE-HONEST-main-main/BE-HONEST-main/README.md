# BEE HONEST

A social media platform for sharing authentic moments and experiences.

## Tech Stack

### Backend
- Node.js
- Express.js
- Firebase/Firestore for database
- Firebase Storage for media files
- Firebase Authentication
- Socket.IO for real-time features

### Frontend
- React.js
- Material-UI
- Redux for state management
- Socket.IO client for real-time features

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   cd BE-HONEST-main
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_CLIENT_CERT_URL=your_client_cert_url
   FIREBASE_API_KEY=your_api_key
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication and authorization
- Create and share reels
- Like and comment on reels
- Real-time notifications
- User profiles
- Friend system
- Chat functionality
- Location-based features
- Media upload and processing

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user

### Reels
- POST /api/reels - Create a new reel
- GET /api/reels/feed - Get reels feed
- GET /api/reels/user/:userId - Get user's reels
- POST /api/reels/:id/like - Like/Unlike a reel
- POST /api/reels/:id/reaction - Add reaction to a reel

### Users
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update user profile
- GET /api/users/:id/friends - Get user's friends

### Chat
- GET /api/chats - Get user's chats
- POST /api/chats - Create new chat
- GET /api/chats/:id - Get chat messages
- POST /api/chats/:id/messages - Send message

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Material-UI for the component library
- Socket.IO for real-time functionality
- Firebase for the database and media storage
- All contributors who have helped with the project

## Support

For support, email support@beehonest.com or join our Slack channel. 