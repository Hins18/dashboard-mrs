// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout'; // <-- Import layout baru
import DashboardPage from './pages/DashboardPage';
import OngoingPage from './pages/OngoingPage';
import AddTaskPage from './pages/AddTaskPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Semua rute di dalam sini akan menggunakan AppLayout sebagai "bungkus" */}
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="ongoing" element={<OngoingPage />} />
          {/* Rute untuk "Done", "Summary", "Log" bisa ditambahkan di sini */}
              <Route path="add-task" element={<AddTaskPage />} /> 

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;