import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './common/Notifications';
import ThemeToggle from './common/ThemeToggle';
import {
  Home, User, FileText, Award, Users, GraduationCap,
  Settings, LogOut, Menu, X, ChevronDown, Shield,
  BookOpen, ClipboardList, Briefcase, BarChart3, Bell
} from 'lucide-react';

const Layout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      // Close dropdown first
      setProfileDropdownOpen(false);
      
      // Call logout function
      await logout();
      
      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout API fails
      setProfileDropdownOpen(false);
      navigate('/');
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { path: '/student/dashboard', icon: Home, label: 'Dashboard', color: 'text-green-600' },
          { path: '/student/profile', icon: User, label: 'My Profile', color: 'text-blue-600' },
          { path: '/student/violations', icon: FileText, label: 'My Violations', color: 'text-orange-600' },
          { path: '/student/certificates', icon: Award, label: 'Certificates', color: 'text-purple-600' },
          { path: '/student/teachers', icon: Users, label: 'View Teachers', color: 'text-indigo-600' },
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', icon: Home, label: 'Dashboard', color: 'text-green-600' },
          { path: '/teacher/profile', icon: User, label: 'My Profile', color: 'text-blue-600' },
          { path: '/teacher/students', icon: GraduationCap, label: 'View Students', color: 'text-teal-600' },
          { path: '/teacher/capstone', icon: BookOpen, label: 'Capstone Management', color: 'text-purple-600' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: Home, label: 'Dashboard', color: 'text-green-600' },
          { path: '/admin/students', icon: GraduationCap, label: 'Students', color: 'text-blue-600' },
          { path: '/admin/teachers', icon: Users, label: 'Teachers', color: 'text-indigo-600' },
          { path: '/admin/violations', icon: ClipboardList, label: 'Violations', color: 'text-orange-600' },
          { path: '/admin/users', icon: Shield, label: 'User Management', color: 'text-red-600' },
          { path: '/admin/logs', icon: BarChart3, label: 'System Logs', color: 'text-purple-600' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    const badges = {
      student: { color: 'bg-green-100 text-green-700 border border-green-200', label: 'Student', icon: GraduationCap },
      teacher: { color: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Teacher', icon: Users },
      admin: { color: 'bg-purple-100 text-purple-700 border border-purple-200', label: 'Administrator', icon: Shield },
    };
    return badges[role] || { color: 'bg-gray-100 text-gray-700 border border-gray-200', label: role };
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-secondary-200 transition-all duration-300 flex flex-col fixed h-full z-30 shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-secondary-800">CCS MS</span>
                <p className="text-xs text-secondary-400">Management System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-500 hover:text-secondary-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-secondary-100 bg-secondary-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-800 truncate text-sm">
                  {user?.firstName || user?.username || 'User'}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color} inline-flex items-center gap-1 mt-1`}>
                  <BadgeIcon className="w-3 h-3" />
                  {badge.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-secondary-200 px-6 py-3 sticky top-0 z-20 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-secondary-800">
                CCS Management System
              </h1>
              <p className="text-xs text-secondary-500">
                College of Computer Studies
              </p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <Notifications />

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown z-50">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-secondary-800">
                      {user?.firstName || user?.username}
                    </p>
                    <p className="text-xs text-secondary-500">{user?.email || 'user@email.com'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown fixed right-4 top-16 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 animate-scale-in z-[100]">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <p className="font-medium text-secondary-800">
                        {user?.firstName || user?.username}
                      </p>
                      <p className="text-sm text-secondary-500">{user?.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color} mt-2 inline-flex items-center gap-1`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
