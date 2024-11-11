import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ReportCreationPage from "./pages/ReportCreationPage";
import AdminDashboard from "./pages/AdminDashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
  
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/ReportCreationPage"
          element={
            <ProtectedRoute>
              <ReportCreationPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<h1>Not found</h1>}/>
      </Routes>
    </Router>
  );
}

export default App;

// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import "./App.css";
// import React, { useEffect, useState } from 'react';
// import axios from "axios";
// import Register from "./pages/Register"; // Adjust the import path if needed
// import Login from "./pages/Login"; // Assuming Login component is in the same directory
// // import ReportManagementComponent from "./pages/ReportManagementComponent";
// // import AdminDashboard from "./pages/AdminDashboard";
// import ReportCreationPage from "./pages/ReportCreationPage";
// // import Logout from "./pages/components/Logout";

// function App() {
//   const [login, setLogin] = useState("");

//   const getLogin = async () => {
//     try {
//       const response = await axios.get("http://localhost:3000/auth/register");
//       // Assuming the response contains the login info in a property like `data` or similar
//       setLogin(response.data.login); // Adjust based on actual response structure
//     } catch (error) {
//       console.error("Error fetching login data:", error);
//     }
//   };

//   useEffect(() => {
//     getLogin();
//   }, []);

//   return (
//     <>
//       {/* <Logout /> */}
//       {/* Conditionally render based on login state */}
//       {login && <p>Logged in as: {login}</p>}
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           {/* <Route path="/reportmanagement" element={<ReportManagementComponent />} /> */}
//           {/* <Route path="/AdminDashboard" element={<AdminDashboard />} /> */}
//           <Route path="/ReportCreationPage" element={<ReportCreationPage />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }

// export default App;
