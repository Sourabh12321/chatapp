import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import './App.css';
import LoginSignupPage from './pages/userAuthPage';
import ChatList from "./pages/chatListPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<LoginSignupPage />} />
          <Route path='/chat' element={<ChatList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
