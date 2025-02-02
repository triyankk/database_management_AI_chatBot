# AI Chatbot with Sales Analysis and Recommendations

This project is an AI-powered chatbot that can query student data from a PostgreSQL database on Neon, convert user questions into SQL queries, and return formatted responses to users. It also provides sales analysis and recommendations.

## Features

- **Natural Language Processing**: Understands and processes user queries in natural language.
- **SQL Query Generation**: Converts user questions into SQL queries to fetch data from the database.
- **Sales Analysis**: Provides insights and analysis on sales data.
- **Recommendations**: Offers recommendations based on the analysis of the data.
- **User Authentication**: Secure login and registration for users.
- **Real-time Responses**: Delivers instant responses to user queries.
- **Customizable**: Easily customizable to fit different use cases and industries.
- **Scalable**: Designed to handle a growing number of users and data.
- **Multi-language Support**: Supports multiple languages for a wider audience reach.
- **Interactive UI**: User-friendly interface for seamless interaction with the chatbot.

## Prerequisites

- Node.js
- PostgreSQL database on Neon
- Google Generative AI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai_chatbot.git
   cd ai_chatbot
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following content:
   ```properties
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   DATABASE_URL=your_postgresql_database_url
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd ../frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to interact with the chatbot.

## Usage

- Type your questions or commands in the input box and press Enter or click the Send button.
- Use the up arrow key to recall the last command in the input box.

## Project Structure

- `frontend/`: Contains the React frontend application.
- `backend/`: Contains the Express backend server and PostgreSQL database connection.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `readme.md`: This file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [pg-promise](https://github.com/vitaly-t/pg-promise)
- [Google Generative AI](https://cloud.google.com/ai-platform)
