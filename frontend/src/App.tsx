// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Layout } from "./components/layout/Layout";
// import { Dashboard } from "./pages/Dashboard";
// import { Skills } from "./pages/Skills";
// import { Projects } from "./pages/Projects";
// import { Profile } from "./pages/Profile";
// import { Login } from "./pages/Login";
// import { AuthCallback } from "./pages/AuthCallback";
// import { useAuth } from "./hooks/useAuth";

// const queryClient = new QueryClient();

// function PrivateRoute({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="animate-pulse text-primary">Loading...</div>
//       </div>
//     );
//   }

//   return user ? <>{children}</> : <Navigate to="/login" />;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/auth/callback" element={<AuthCallback />} />
//       <Route
//         path="/"
//         element={
//           <PrivateRoute>
//             <Layout />
//           </PrivateRoute>
//         }
//       >
//         <Route index element={<Dashboard />} />
//         <Route path="skills" element={<Skills />} />
//         <Route path="projects" element={<Projects />} />
//         <Route path="profile" element={<Profile />} />
//       </Route>
//     </Routes>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <AppRoutes />
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }

// export default App;

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Skills } from "./pages/Skills";
import { Projects } from "./pages/Projects";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - NO auth required */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="skills" element={<Skills />} />
        <Route path="projects" element={<Projects />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
