// src/components/Sidebar.tsx
import { LayoutDashboard, Clock, CheckCircle, BarChart, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to }: { icon: React.ElementType, label: string, to: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to}
      className={`w-full flex items-center p-3 rounded-lg text-left text-gray-600 ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
    >
      <Icon className="mr-3" size={20} />
      {label}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white p-6 border-r flex-shrink-0 flex-col hidden lg:flex">
      <div className="flex items-center mb-10">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" alt="PLN Logo" className="h-10 mr-3"/>
        <span className="font-bold text-xl text-gray-800">DIV. MRS</span>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
        <NavItem icon={Clock} label="Ongoing" to="/ongoing" />
        <NavItem icon={CheckCircle} label="Done" to="/done" />
      </nav>
    </aside>
  );
}