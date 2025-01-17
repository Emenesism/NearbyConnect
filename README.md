# NearbyConnect

Welcome to the **NearbyConnect** backend repository! This project is designed to provide a simple website with login and registration features using NodeJS, Express, Prisma, MySQL, and more. **NearbyConnect** is a backend application built with NodeJS and Express, featuring a simple HTML frontend. This project supports user registration, login, and profile management, with functionalities to explore nearby users and interact in real-time.

---

## Project Description

NearbyConnect allows users to register, log in, and interact with other users through likes and dislikes. Users can upload multiple avatar images, provide a bio, and select their location from a map. The application leverages WebSockets for real-time notifications when a user receives likes from others.

### Schema Overview

The schema defines several relations between models to manage user interactions:

- **User-Image Relation**: The `User` model is linked to the `Image` model through a one-to-many relationship. This is represented by the `UserImages` relation, allowing each user to have multiple images.

- **Like and Dislike Relations**: Users can like or dislike each other, managed by the `Like` and `Dislike` models. These models establish many-to-many relationships between users through two separate relations:
  - `UserLikes` and `LikedByUser` for likes.
  - `UserDislikes` and `DislikedByUser` for dislikes.

- **Foreign Keys**: Each relation in the `Like` and `Dislike` models is connected via foreign key fields (`userId`, `likedById`, and `dislikedById`) that reference the `User` model's `id` field.

### Project Setup and Installation

To run the project, please follow these steps:

1. **Create the Database**:
   - Ensure you have a MySQL database created for this project.

2. **Configure Environment Variables**:
   - Add your database URL and other necessary environment variables in a `.env` file. Make sure to specify `DATABASE_URL`, `JWT_SECRET`, and other required values.

3. **Install Dependencies**:
   - Run the following command to install the required dependencies:
     ```bash
     sudo npm install
     ```

4. **Generate Prisma Client**:
   - Use the following command to generate the Prisma client:
     ```bash
     npx prisma generate
     ```

5. **Apply Database Migrations**:
   - Run the migration command to apply database migrations:
     ```bash
     npx prisma migrate dev --name <migration-name>
     ```

6. **Seed the Database**:
   - Run the seed command to populate the database with initial data:
     ```bash
     npm run seed
     ```

7. **Start the Development Server**:
   - Start the server using the following command:
     ```bash
     npm run dev
     ```

### Running the Project

- **API Documentation**:
  - Once the server is running, you can view the API documentation by visiting `http://localhost:<port>/docs`, where `<port>` is the port number your server is running on.

- **WebSocket**:
  - The WebSocket feature has been implemented to receive notifications when a user likes your account. However, due to limited knowledge of frontend technologies, the ability to send data from the frontend to the backend using WebSocket has not been fully realized. Your understanding in this regard is greatly appreciated.

---

### Available Routes

Below are the available routes that serve user functionalities:

- **User Authentication**:
  - `GET /login`: Login to the application.
  - `GET /register`: Register a new user.

- **User Management**:
  - `GET /user/nearby`: Fetch a list of nearby users.
  - `GET /profile`: Update user profile information.

---

Feel free to reach out if you have any questions or need further assistance. Happy coding!
