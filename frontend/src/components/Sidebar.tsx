import React, { useState } from 'react';
import { Home, Settings, User, LogOut, UserCog, Plus, AlertTriangle, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectList from './ProjectList';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import JoinProject from './project/JoinProject';
import NotificationBell from './notifications/NotificationBell';

export const Sidebar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Sửa lại việc kiểm tra quyền ADMIN để tránh lỗi khi currentUser là null/undefined 
  const isAdmin = currentUser?.user.roles ? currentUser.user.roles.includes('ADMIN') : false;
  const isInstructor = currentUser?.user.roles ? currentUser.user.roles.includes('INSTRUCTOR') : false;
  // Handle navigation to create project page for instructors, or open join dialog for students
  const handleCreateProject = () => {
    // Instructors and admins can create projects
    if (isInstructor || isAdmin) {
      navigate('/projects/create');
    }
  };
  
  // Handle join project for students
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const openJoinDialog = () => {
    setJoinDialogOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with logo and toggle button */}      
      <div className="flex items-center px-4 py-5">
        {!isCollapsed && (
          <>
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center mr-3">
              <span className="text-white text-lg">✉️</span>
            </div>
            <span className="font-semibold text-gray-800">TasuMana Inc.</span>
          </>
        )}
        <div className={cn("flex items-center gap-2", isCollapsed ? "ml-0" : "ml-auto")}>
          {!isCollapsed && <NotificationBell />}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100" 
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>      
      {/* Search bar */}
      {!isCollapsed && (
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
      )}
        {/* Main navigation */}      
      <nav className="mt-2">
        <ul>
          <NavItem icon={<Home size={18} />} label="Home" to="/" active={location.pathname === '/'} isCollapsed={isCollapsed} />
          {isAdmin && (
            <NavItem icon={<UserCog size={18} />} label="Admin" to="/admin" active={location.pathname === '/admin'} isCollapsed={isCollapsed} />
          )}
          {isInstructor && (
            <NavItem 
              icon={<AlertTriangle size={18} />} 
              label="Free-Rider Detection" 
              to="/freerider-detection" 
              active={location.pathname.includes('/freerider-detection')} 
              isCollapsed={isCollapsed}
            />
          )}
        </ul>
      </nav>
        {/* Projects section */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 py-1">
          {!isCollapsed && <span className="text-xs font-medium text-gray-500">PROJECTS</span>}          
          <div className="flex">
            {isInstructor || isAdmin ? (
              <button 
                className="text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
                onClick={handleCreateProject}
                title="Create Project"
              >
                <Plus size={16} />
              </button>
            ) : (
              <button 
                className="text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
                onClick={() => setJoinDialogOpen(true)}
                title="Join a Project"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
        
        <ProjectList isCollapsed={isCollapsed} />
      </div>
        {/* Footer navigation */}
      <div className="mt-auto">
        <ul>
          <NavItem icon={<Settings size={18} />} label="Settings" to="/settings" active={location.pathname === '/settings'} isCollapsed={isCollapsed} />
          <NavItem icon={<User size={18} />} label="Profile" to="/profile" active={location.pathname === '/profile'} isCollapsed={isCollapsed} />
          <li>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Log Out" : ""}
            >
              <span className={cn("text-gray-500", isCollapsed ? "mr-0" : "mr-3")}><LogOut size={18} /></span>
              {!isCollapsed && <span>Log Out</span>}
            </button>
          </li>
        </ul>
      </div>
        {/* Join Project Dialog for students */}
      <JoinProject 
        isOpen={joinDialogOpen}
        onOpenChange={(open) => setJoinDialogOpen(open)}
        onSuccess={() => {
          setJoinDialogOpen(false);
          // Refresh the project list
          window.location.reload();
        }}
      />
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  isCollapsed?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active = false, isCollapsed = false }) => {
  return (
    <li>
      <Link 
        to={to} 
        className={cn(
          "flex items-center px-4 py-2 text-sm hover:bg-gray-100",
          active ? "text-blue-600 bg-blue-50" : "text-gray-800",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? label : ""}
      >
        <span className={cn("text-gray-500", isCollapsed ? "mr-0" : "mr-3")}>{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </li>
  );
};

export default Sidebar;
