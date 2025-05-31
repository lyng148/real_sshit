import React, { useState, useEffect, useRef } from 'react';
import { Home, Settings, User, LogOut, UserCog, Plus, AlertTriangle, Menu, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectList from './ProjectList';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import JoinProject from './project/JoinProject';
import NotificationBell from './notifications/NotificationBell';
import { animations } from '@/lib/animations';
import { animate, stagger } from 'animejs';

export const Sidebar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  
  // Sửa lại việc kiểm tra quyền ADMIN để tránh lỗi khi currentUser là null/undefined 
  const isAdmin = currentUser?.user.roles ? currentUser.user.roles.includes('ADMIN') : false;
  const isInstructor = currentUser?.user.roles ? currentUser.user.roles.includes('INSTRUCTOR') : false;

  // Animate on component mount - only once
  useEffect(() => {
    if (sidebarRef.current && !hasAnimated) {
      // Entrance animation
      animations.page.slideInFromLeft(sidebarRef.current, 0);
      
      // Stagger nav items
      setTimeout(() => {
        animations.list.staggeredAppear('.nav-item', 60);
      }, 300);
      
      setHasAnimated(true);
    }
  }, []); // Remove hasAnimated dependency to prevent re-running

  // Handle navigation to create project page for instructors, or open join dialog for students
  const handleCreateProject = () => {
    // Add click animation
    const createBtn = document.querySelector('.create-project-btn');
    if (createBtn) {
      animations.button.click(createBtn as HTMLElement);
    }
    
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

  // Handle logout with animation
  const handleLogout = () => {
    // Animate sidebar sliding out
    if (sidebarRef.current) {
      animate(sidebarRef.current, {
        translateX: [-100],
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInCubic'
      }).then(() => {
        logout();
        navigate('/login');
      });
    }
  };

  // Handle sidebar toggle with smooth animation
  const handleSidebarToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsCollapsed(!isCollapsed);
    
    // Animate width change
    if (sidebarRef.current) {
      animate(sidebarRef.current, {
        width: isCollapsed ? '256px' : '64px',
        duration: 300,
        easing: 'easeOutCubic'
      });
    }

    // Animate nav items
    if (!isCollapsed) {
      // Collapsing - fade out labels
      animate('.nav-label', {
        opacity: [1, 0],
        translateX: [-10],
        duration: 200,
        easing: 'easeInCubic'
      });
    } else {
      // Expanding - fade in labels
      setTimeout(() => {
        animate('.nav-label', {
          opacity: [0, 1],
          translateX: [10, 0],
          duration: 200,
          delay: stagger(50),
          easing: 'easeOutCubic'
        });
      }, 150);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div 
      ref={sidebarRef}
      className={cn(
        "h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with logo and toggle button */}      
      <div className="flex items-center px-4 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        {!isCollapsed && (
          <>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ITss</span>
          </>
        )}
        <div className={cn("flex items-center gap-2", isCollapsed ? "ml-0" : "ml-auto")}>
          {!isCollapsed && <NotificationBell />}
          <button 
            onClick={handleSidebarToggle}
            className="text-gray-400 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-all duration-300 hover:scale-110" 
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>      

      {/* Search bar with enhanced styling */}
      {!isCollapsed && (
        <div className="px-4 py-3 relative">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">K</span>
            </div>
          </div>
        </div>
      )}

      {/* Main navigation với enhanced styling */}      
      <nav className="mt-4 px-2">
        <ul className="space-y-1 px-2">
          <NavItem icon={<Home size={18} />} label="Trang chủ" to="/" active={location.pathname === '/'} isCollapsed={isCollapsed} />
          {isAdmin && (
            <NavItem icon={<Users size={18} />} label="Quản lý người dùng" to="/admin/dashboard" active={location.pathname === '/admin/dashboard'} isCollapsed={isCollapsed} />
          )}
          {isInstructor && (
            <NavItem 
              icon={<AlertTriangle size={18} />} 
              label="Phát hiện Free-Rider" 
              to="/freerider-detection" 
              active={location.pathname.includes('/freerider-detection')} 
              isCollapsed={isCollapsed}
            />
          )}
        </ul>
      </nav>

      {/* Projects section với enhanced styling */}
      <div className="mt-6 flex-1">
        <div className="flex items-center justify-between px-4 py-2">
          {!isCollapsed && <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dự án</span>}          
          <div className="flex">
            {isInstructor || isAdmin ? (
              <button 
                className="create-project-btn text-gray-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-all duration-300 hover:scale-110"
                onClick={handleCreateProject}
                title="Tạo dự án mới"
              >
                <Plus size={16} />
              </button>
            ) : (
              <button 
                className="text-gray-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-all duration-300 hover:scale-110"
                onClick={() => setJoinDialogOpen(true)}
                title="Tham gia dự án"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
        
        <ProjectList isCollapsed={isCollapsed} />
      </div>

      {/* Footer navigation với enhanced styling */}
      <div className="mt-auto border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <ul className="space-y-1 p-2">
          <NavItem icon={<Settings size={18} />} label="Cài đặt" to="/settings" active={location.pathname === '/settings'} isCollapsed={isCollapsed} />
          <NavItem icon={<User size={18} />} label="Hồ sơ" to="/profile" active={location.pathname === '/profile'} isCollapsed={isCollapsed} />
          <li className="nav-item">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 group",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Đăng xuất" : ""}
            >
              <span className={cn("text-gray-500 group-hover:text-red-500 transition-colors duration-300", isCollapsed ? "mr-0" : "mr-3")}>
                <LogOut size={18} />
              </span>
              {!isCollapsed && <span className="nav-label">Đăng xuất</span>}
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
    <li className="nav-item">
      <Link 
        to={to}
        className={cn(
          "flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-300 group relative overflow-hidden",
          active 
            ? "text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm" 
            : "text-gray-700 hover:text-purple-600 hover:bg-purple-50",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? label : ""}
      >
        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
        )}
        
        <span className={cn(
          "transition-colors duration-300 relative z-10",
          active ? "text-purple-600" : "text-gray-500 group-hover:text-purple-500",
          isCollapsed ? "mr-0" : "mr-3"
        )}>
          {icon}
        </span>
        
        {!isCollapsed && (
          <span className="nav-label font-medium relative z-10">{label}</span>
        )}

        {/* Hover effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/5 group-hover:to-pink-400/5 transition-all duration-300 rounded-lg" />
      </Link>
    </li>
  );
};

export default Sidebar;
