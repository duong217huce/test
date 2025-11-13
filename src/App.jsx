import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import CategoryPage from "./components/CategoryPage";
import UploadPage from "./components/UploadPage";
import DocumentDetailPage from "./components/DocumentDetailPage";
import SavedPage from "./components/SavedPage";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/document/:id" element={<DocumentDetailPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
