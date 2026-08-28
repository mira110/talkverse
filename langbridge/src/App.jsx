import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Selector from "./pages/Selector";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/layout/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/select" element={<Selector />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;