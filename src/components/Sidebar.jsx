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
  const [isOpen, setIsOpen] = useState(true);
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

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-white to-medical-50 shadow-xl h-full flex flex-col transition-all duration-300 border-r-2 border-primary-200`}>
      <div className="p-5 flex items-center justify-between border-b-2 border-primary-200 bg-gradient-to-r from-primary-50 to-transparent">
        {isOpen && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md">
              <span className="text-lg font-bold">🏥</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">HIMS</h2>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-primary-100 rounded-lg transition-all duration-200 text-medical-600 hover:text-primary-700 hover:shadow-md">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.submenu ? (
              <div>
                <button
                  onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    expandedMenu === item.label
                      ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm'
                      : 'text-medical-700 hover:bg-primary-50'
                  }`}
                >
                  <item.icon size={20} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${expandedMenu === item.label ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
                {isOpen && expandedMenu === item.label && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-primary-400 pl-3">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        to={subitem.path}
                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-600'
                    : 'text-medical-700 hover:bg-primary-50'
                }`}
              >
                <item.icon size={20} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-50 to-transparent">
        {isOpen && <p className="text-xs text-medical-600 text-center font-semibold">HIMS v1.0</p>}
      </div>
    </div>
  );
}

export default Sidebar;
