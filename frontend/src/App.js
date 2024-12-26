import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";  // HashRouter kullanıyoruz
import Login from "./pages/Login";
import Admin from "./pages/Admin";  // Admin sayfası
import Restoran from "./pages/Restoran";  // Restoran sayfası
import Homepage from "./pages/Homepage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/restoran" element={<Restoran />} />
                <Route path="/" element={<Homepage />} /> {/* Login sayfasını varsayılan olarak ayarlıyoruz */}
            </Routes>
        </Router>
    );
};

export default App;
