# AIChatbot

A modern full-stack AI Chatbot application powered by React, Vite, Tailwind CSS, Node.js, Express, MongoDB, and the OpenAI API.

---

## 🚀 Tech Stack

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) REST API
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **AI**: [OpenAI Node SDK](https://platform.openai.com/docs/api-reference) (with tone-aware completions & fallbacks)

---

## 📁 Project Structure

```
AIChatbot/
├── client/                     # Frontend application (React + Vite + Tailwind CSS)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Modular reusable components
│   │   │   ├── ChatArea.jsx    # Messages stream & welcome state container
│   │   │   ├── ChatInput.jsx   # Multiline input, tone pill, shortcuts & send button
│   │   │   ├── Header.jsx      # Top navigation with tone selector & menu trigger
│   │   │   ├── MessageItem.jsx # User/AI message bubbles with copy & regenerate
│   │   │   ├── Sidebar.jsx     # Collapsible history drawer, new chat & delete
│   │   │   ├── ToneSelector.jsx# Professional / Casual / Concise dropdown
│   │   │   └── WelcomeScreen.jsx # Greeting & 4 suggested prompt cards
│   │   ├── services/
│   │   │   └── api.js          # Client-side API service connecting to Express backend
│   │   ├── App.jsx             # Main frontend state manager (MongoDB sync)
│   │   ├── index.css           # Global stylesheet & Tailwind directives
│   │   └── main.jsx            # React root mount point
│   ├── .env                    # Local frontend environment variables (git-ignored)
│   ├── .env.example            # Sample frontend environment file
│   ├── index.html              # Vite HTML entry point
│   ├── package.json            # Client dependencies and scripts
│   ├── postcss.config.js       # PostCSS configuration for Tailwind
│   ├── tailwind.config.js      # Tailwind CSS theme & content rules
│   └── vite.config.js          # Vite config with /api reverse proxy to port 5000
├── server/                     # Backend API server (Express + Node.js)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose MongoDB connection & error handling
│   │   ├── controllers/
│   │   │   └── chatController.js # REST API route controllers
│   │   ├── models/
│   │   │   └── Chat.js         # Mongoose schema (chatId, title, messages, timestamps)
│   │   ├── routes/
│   │   │   └── chatRoutes.js   # Chat REST endpoints (/api/chats)
│   │   ├── services/
│   │   │   ├── aiService.js    # OpenAI integration & tone-aware response generation
│   │   │   └── storageService.js # Storage abstraction (MongoDB with resilient fallback)
│   │   └── index.js            # Express server entry point & middleware
│   ├── .env                    # Local server environment variables (git-ignored)
│   ├── .env.example            # Sample server environment file
│   └── package.json            # Server dependencies and scripts
├── .gitignore                  # Git ignore rules for node_modules, .env, dist, etc.
├── package.json                # Root package.json with unified execution scripts
└── README.md                   # Project documentation
```

---

## 🗄️ Database Model (`server/src/models/Chat.js`)

Each conversation is represented by the Mongoose `Chat` schema:

```javascript
{
  chatId: String,          // Unique conversation identifier (indexed)
  title: String,           // Conversation title (auto-generated from first message)
  messages: [
    {
      id: String,          // Unique message identifier
      role: String,        // 'user' | 'assistant'
      content: String,     // Message text content
      tone: String,        // 'Professional' | 'Casual' | 'Concise'
      timestamp: String,   // Formatted time string
      createdAt: Date,
      updatedAt: Date
    }
  ],
  createdAt: Date,         // Managed automatically by timestamps: true
  updatedAt: Date          // Managed automatically by timestamps: true
}
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description | Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Backend and database status | Returns health status & DB mode |
| `POST` | `/api/chats` | Create a new conversation | Body: `{ title?: string, chatId?: string }` |
| `GET` | `/api/chats` | Retrieve all conversations | Returns `{ success: true, count, chats: [...] }` |
| `GET` | `/api/chats/:id` | Retrieve single conversation | Returns `{ success: true, chat: {...} }` |
| `DELETE` | `/api/chats/:id` | Delete conversation by ID | Returns `{ success: true, message, chatId }` |
| `POST` | `/api/chats/:id/messages` | Save user message & AI response | Body: `{ content: string, tone?: string }` |

---

## ⚙️ Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aichatbot
OPENAI_API_KEY=your_openai_api_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚦 Running the Application

### 1. Start Backend:
```bash
npm run server
# Runs Express on http://localhost:5000
```

### 2. Start Frontend:
```bash
npm run client
# Runs Vite on http://localhost:5173
```
