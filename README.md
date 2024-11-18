
# WEB-ARLAN-MIRSEIIT-2306

This project is a web application that provides a platform for managing user portfolios with features like registration, login, and CRUD operations. It is built using modern web technologies for the backend and frontend.

---

## Table of Contents
1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Getting Started](#getting-started)
4. [Installation](#installation)
5. [Testing with Postman](#testing-with-postman)
   - [User Registration](#user-registration)
   - [User Login](#user-login)
   - [Portfolio CRUD Operations](#portfolio-crud-operations)
6. [Contributing](#contributing)
7. [License](#license)

---

## Features
- **User Authentication**: 
  - Registration
  - Login with JWT (JSON Web Tokens)
- **Portfolio Management**:
  - Add, update, delete, and retrieve portfolio items.
- **REST API**: Exposes endpoints for all operations.

---

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Postman
- **Other Tools**: EJS (for templating, if applicable), Mongoose (for database modeling)

---

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB instance running locally or hosted
- Postman for API testing

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sweetkumys/WEB-ARLAN-MIRSEIIT-2306.git
   cd WEB-ARLAN-MIRSEIIT-2306
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure the following:
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/portfolioDB
   JWT_SECRET=your-secret-key
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run at `http://localhost:3000`.

---

## Testing with Postman

### Base URL
- Local: `http://localhost:3000/api`

### Endpoints

#### 1. **User Registration**
- **Endpoint**: `POST /api/auth/register`
- **Request Body** (JSON):
  ```json
  {
  "username": "testuser",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "gender": "male",
  "email": "testuser@example.com",
  "twoFactorAuth": true
 }
  ```
- **Expected Response** (201 Created):
  ```json
  {
  "info": {
    "name": "Portfolio Platform",
    "description": "API tests for Portfolio Platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"password123\",\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"age\": 30,\n  \"gender\": \"male\",\n  \"email\": \"testuser@example.com\",\n  \"twoFactorAuth\": true\n}"
        },
        "url": {
          "raw": "http://localhost:3000/register",
          "protocol": "http",
          "host": [
            "localhost"
          ],
          "port": "3000",
          "path": [
            "register"
          ]
        }
      },
      "response": []
    }
  ]
}
  ```

#### 2. **User Login**
- **Endpoint**: `POST /api/auth/login`
- **Request Body** (JSON):
  ```json
  {
    "username": "testuser",
    "password": "password123",
    "verificationCode": "2FA token"
  }


#### 3. **Portfolio CRUD Operations**

##### a. **Add Portfolio**
- **Endpoint**: `POST /api/portfolio`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Request Body** (JSON):
  ```json
  {
    "title": "Web Development",
    "description": "Building responsive websites.",
    "technologies": ["HTML", "CSS", "JavaScript"],
    "link": "https://portfolio.example.com/web-dev"
  }
  ```
- **Expected Response** (201 Created):
  ```json
  {
    "message": "Portfolio item created successfully",
    "portfolio": {
      "id": "unique-portfolio-id",
      "title": "Web Development",
      "description": "Building responsive websites."
    }
  }
  ```

##### b. **Get All Portfolios**
- **Endpoint**: `GET /api/portfolio`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Expected Response** (200 OK):
  ```json
  [
    {
      "id": "portfolio-id-1",
      "title": "Web Development",
      "description": "Building responsive websites."
    },
    {
      "id": "portfolio-id-2",
      "title": "Mobile Development",
      "description": "Creating cross-platform apps."
    }
  ]
  ```

##### c. **Update Portfolio**
- **Endpoint**: `PUT /api/portfolio/:id`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Request Body** (JSON):
  ```json
  {
    "title": "Updated Web Development",
    "description": "Improved responsive websites."
  }
  ```
- **Expected Response** (200 OK):
  ```json
  {
    "message": "Portfolio item updated successfully",
    "portfolio": {
      "id": "unique-portfolio-id",
      "title": "Updated Web Development",
      "description": "Improved responsive websites."
    }
  }
  ```

##### d. **Delete Portfolio**
- **Endpoint**: `DELETE /api/portfolio/:id`
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
- **Expected Response** (200 OK):
  ```json
  {
    "message": "Portfolio item deleted successfully"
  }
  ```

---

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

Feel free to test the application and provide feedback. Contributions are welcome!
