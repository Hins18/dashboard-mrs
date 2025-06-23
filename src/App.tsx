// src/App.tsx
import TaskPage from './pages/TaskPage';
import './index.css' // Pastikan file css diimpor jika styling ada di sana

function App() {
  // Langsung tampilkan halaman tugas tanpa logika login
  return <TaskPage />;
}

export default App;