import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import RequireAuth from "@/components/layout/RequireAuth";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Analyze from "@/pages/Analyze";
import Report from "@/pages/Report";
import Profile from "@/pages/Profile";
import History from "@/pages/History";
import Insights from "@/pages/Insights";
import Compare from "@/pages/Compare";
import Applications from "@/pages/Applications";
import Progress from "@/pages/Progress";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/analyze"
          element={
            <RequireAuth>
              <Analyze />
            </RequireAuth>
          }
        />
        <Route
          path="/report/:id"
          element={
            <RequireAuth>
              <Report />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />
        <Route
          path="/insights"
          element={
            <RequireAuth>
              <Insights />
            </RequireAuth>
          }
        />
        <Route
          path="/compare"
          element={
            <RequireAuth>
              <Compare />
            </RequireAuth>
          }
        />
        <Route
          path="/applications"
          element={
            <RequireAuth>
              <Applications />
            </RequireAuth>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireAuth>
              <Progress />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
