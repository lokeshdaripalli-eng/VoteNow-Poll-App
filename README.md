# Real-Time Poll Application

A full-stack polling application featuring dynamic poll creation, secure voting with local tracking, and real-time-like result visualizations. 

## Project Explanation
This application allows users to create interactive polls with customizable options. When a user casts a vote, they immediately see live results with animated progress bars displaying the vote percentages. The UI is designed to be clean, modern, and highly responsive using Vanilla HTML, CSS, and JS. The backend is a lightweight Node.js/Express server using an in-memory database, demonstrating clean RESTful API design.

## Features & Functionality
- **Poll Creation**: Create polls with a custom question and exactly 2 to 4 options. The frontend dynamically allows adding or removing option fields.
- **Voting System**: Users can vote on any active poll. A client-side tracking mechanism via `localStorage` prevents duplicate voting from the same browser.
- **Live Results**: Immediately upon voting, the UI smoothly transitions to a results view showing percentage bars, individual vote counts, and total votes. The winning option is highlighted.
- **Poll Management**: Users can view all active polls, easily refresh the list, and delete polls seamlessly. 

## Code Quality & Structure
The project is modularized into distinct `frontend` and `backend` directories, ensuring clear separation of concerns.
- **Backend (`/backend`)**: Built with Express. It uses straightforward routing and modular endpoint definitions, handling in-memory state cleanly and efficiently.
- **Frontend (`/frontend`)**: Developed without frameworks to maintain a small footprint. `app.js` is organized logically into DOM element selection, state management, event listeners, API interactions, and UI rendering functions. `style.css` utilizes CSS variables for consistent theming and easy maintenance.

## UI/UX Design & Visualization
The design adopts a premium, sleek dark-mode aesthetic with vibrant accent colors.
- Custom typography (`Inter` font).
- Smooth CSS animations for form interactions, poll rendering (`slideUp`), and result bar expansion.
- Hover effects, interactive buttons, and clear badges indicating user state (e.g., "You voted").

## Error Handling & Validation
- **Frontend**: Validates empty inputs, minimum (2), and maximum (4) options before submission. Prevents multiple rapid clicks by disabling vote buttons immediately upon selection. Gracefully handles failed API requests with user-friendly error messages.
- **Backend**: Validates payload structure. Rejects polls with invalid option arrays, prevents voting on non-existent options or polls, and returns appropriate HTTP status codes (400, 404).

## Project Structure
```
/poll-app
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### 1. Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:3000`*

### 2. Run the Frontend
Because the frontend uses standard HTML/CSS/JS, you can simply open `frontend/index.html` in your web browser. 
If you are using VS Code, you can also use an extension like **Live Server** to serve the files.

## API Endpoints Overview
- `GET /polls` - Fetch all polls
- `POST /polls` - Create a new poll
- `POST /polls/:id/vote` - Vote on a specific option
- `DELETE /polls/:id` - Delete a poll
- `GET /polls/:id/results` - Get detailed results for a poll
