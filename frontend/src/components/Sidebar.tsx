import React, { useState } from 'react';
import { Home, Settings, User, LogOut, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectList from './ProjectList';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = () => {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Sửa lại việc kiểm tra quyền ADMIN để tránh lỗi khi currentUser là null/undefined 
  const isAdmin = currentUser?.user.roles ? currentUser.user.roles.includes('ADMIN') : false;

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with logo */}
      <div className="flex items-center px-4 py-5">
        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center mr-3">
          <span className="text-white text-lg">✉️</span>
        </div>
        <span className="font-semibold text-gray-800">MindTask Inc.</span>
        <button className="ml-auto text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Search bar */}
      <div className="px-4 py-2 relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10 py-1.5 w-full border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-xs text-gray-400 border border-gray-200 rounded px-1">K</span>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <nav className="mt-2">
        <ul>
          <NavItem icon={<Home size={18} />} label="Home" to="/" active={location.pathname === '/'} />
          {isAdmin && (
            <NavItem icon={<UserCog size={18} />} label="Admin" to="/admin" active={location.pathname === '/admin'} />
          )}
        </ul>
      </nav>
      
      {/* Projects section */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 py-1">
          <span className="text-xs font-medium text-gray-500">PROJECTS</span>
          <div className="flex">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600 ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        
        <ProjectList />
      </div>
      
      {/* Footer navigation */}
      <div className="mt-auto">
        <ul>
          <NavItem icon={<Settings size={18} />} label="Settings" to="/settings" active={location.pathname === '/settings'} />
          <NavItem icon={<User size={18} />} label="Profile" to="/profile" active={location.pathname === '/profile'} />
          <NavItem icon={<LogOut size={18} />} label="Log Out" to="#" />
        </ul>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active = false }) => {
  return (
    <li>
      <Link 
        to={to} 
        className={cn(
          "flex items-center px-4 py-2 text-sm hover:bg-gray-100",
          active ? "text-blue-600 bg-blue-50" : "text-gray-800"
        )}
      >
        <span className="mr-3 text-gray-500">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
};

export default Sidebar;
