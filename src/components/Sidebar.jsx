import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Heart,
  Activity,
  Bed,
  AlertCircle,
  DollarSign,
  FileText,
  Archive,
  ChevronDown,
  Menu,
  X,
  Info,
  Settings
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/discharged', label: 'Discharged Patients', icon: Archive },
    { path: '/doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/nurses', label: 'Nurses', icon: Heart },
    {
      label: 'Departments',
      icon: Activity,
      submenu: [
        { path: '/opd', label: 'OPD' },
        { path: '/ipd', label: 'IPD' },
        { path: '/icu', label: 'ICU' }
      ]
    },
    { path: '/billing', label: 'Billing', icon: DollarSign },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/archives', label: 'Archives', icon: Archive },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={closeSidebar} />
      )}
      
      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-white to-medical-50 shadow-xl h-screen flex flex-col transition-all duration-300 border-r-2 border-primary-200 fixed md:relative z-40 w-64 top-0 ${isOpen ? 'left-0' : '-left-64 md:left-0'}`}>
        <div className="p-4 sm:p-5 flex items-center justify-between border-b-2 border-primary-200 bg-gradient-to-r from-primary-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md">
              <span className="text-base sm:text-lg font-bold">🏥</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">HIMS</h2>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-2 hover:bg-primary-100 rounded-lg transition-all duration-200 text-medical-600 hover:text-primary-700">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                      expandedMenu === item.label
                        ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm'
                        : 'text-medical-700 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon size={18} className="sm:w-5 sm:h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedMenu === item.label && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-primary-400 pl-3">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.path}
                          to={subitem.path}
                          onClick={closeSidebar}
                          className={`block px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                            isActive(subitem.path)
                              ? 'bg-primary-100 text-primary-700 shadow-sm'
                              : 'text-medical-700 hover:bg-primary-50'
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-600'
                      : 'text-medical-700 hover:bg-primary-50'
                  }`}
                >
                  <item.icon size={18} className="sm:w-5 sm:h-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 sm:p-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex flex-col items-center gap-2">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F521006238d0c488b88ea924156fa8e07%2F99f3a89b07dd47cebd53e1166682c659?format=webp&width=800" alt="Nexus Group" className="h-6 object-contain" />
            <div className="text-center">
              <p className="text-xs font-bold text-gray-900">Nexus Group</p>
              <p className="text-xs text-primary-600">Professional software developers</p>
            </div>
            <p className="text-xs text-medical-500 mt-1">© 2024 HIMS v1.0</p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-35"
        title="Toggle Menu"
      >
        <Menu size={24} />
      </button>
    </>
  );
}

export default Sidebar;
