# TinyLink - URL Shortener

A full-stack URL shortening service built with Node.js, Express, React, and SQLite.

## Features

- ✨ Shorten long URLs into compact, shareable links
- 🔗 Redirect short URLs to original destinations
- 📊 Track click statistics for each shortened URL
- 🎨 Clean, modern user interface
- 🗄️ SQLite database for persistent storage
- ⚡ Fast and lightweight

## Tech Stack

**Backend:**
- Node.js
- Express.js
- SQLite3
- nanoid (for generating short codes)

**Frontend:**
- React
- CSS3
- Fetch API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd WebApp
```

2. Install dependencies for both server and client
```bash
npm run install-all
```

3. Create a `.env` file in the root directory
```bash
cp .env.example .env
```

4. Configure environment variables in `.env` file as needed

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the React frontend:
```bash
npm run client
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

### Production Mode

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## API Endpoints

### Create Short URL
- **POST** `/api/shorten`
- Body: `{ "originalUrl": "https://example.com" }`
- Response: `{ "shortUrl": "http://localhost:5000/abc123", "shortCode": "abc123" }`

### Redirect to Original URL
- **GET** `/:shortCode`
- Redirects to the original URL

### Get URL Statistics
- **GET** `/api/stats/:shortCode`
- Response: `{ "originalUrl": "https://example.com", "clicks": 10, "created": "2024-01-01" }`

### Get All URLs
- **GET** `/api/urls`
- Response: Array of all shortened URLs with statistics

### Delete URL
- **DELETE** `/api/urls/:shortCode`
- Deletes a shortened URL

## Project Structure

```
WebApp/
├── server/
│   ├── index.js          # Express server setup
│   ├── db.js             # Database operations
│   └── routes/
│       └── urls.js       # API routes
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── index.js      # React entry point
│   └── package.json
├── package.json
├── .env.example
└── README.md
```

## Usage

1. Open the application in your browser
2. Enter a long URL in the input field
3. Click "Shorten URL"
4. Copy the generated short URL
5. Share it with others
6. View statistics for your shortened URLs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
