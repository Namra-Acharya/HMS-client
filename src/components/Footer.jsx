import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-medical-800 to-medical-900 text-white border-t border-medical-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              Nexus Group
            </h3>
            <p className="text-sm text-gray-300 mb-3">Professional Hospital Information Management System with Offline Support</p>
            <p className="text-xs text-gray-400">HIMS v1.0</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Mail size={16} className="mt-1 flex-shrink-0" />
                <a href="mailto:nexushelpus@gmail.com" className="text-gray-300 hover:text-white transition">
                  nexushelpus@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <p className="text-gray-300">Hospital Information Management</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-3">Admin</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Namra Acharya</p>
              <Link to="/about" className="text-sm text-primary-400 hover:text-primary-300 transition block">
                About Us →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-medical-700 mt-8 pt-6 text-center text-xs text-gray-400">
          <p>&copy; 2024 Nexus Group Hospital Information Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
