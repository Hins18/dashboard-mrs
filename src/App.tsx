// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import OngoingPage from './pages/OngoingPage';
import DonePage from './pages/DonePage';
import AddTaskPage from './pages/AddTaskPage';
import EditOngoingTaskPage from './pages/EditOngoingTaskPage';
import EditDoneTaskPage from './pages/EditDoneTaskPage';
import AddDoneTaskPage from './pages/AddDoneTaskPage'; // <-- 1. IMPORT HALAMAN BARU
import LogPage from './pages/LogPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ongoing" element={<OngoingPage />} />
          <Route path="done" element={<DonePage />} />
          <Route path="add-task" element={<AddTaskPage />} />
          <Route path="add-done-task" element={<AddDoneTaskPage />} /> {/* <-- 2. DAFTARKAN RUTE BARU DI SINI */}
          <Route path="edit-ongoing/:taskId" element={<EditOngoingTaskPage />} />
          <Route path="edit-done/:taskId" element={<EditDoneTaskPage />} />
          <Route path="log" element={<LogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;