import React from 'react';
import { Mail, Heart, Users, Zap } from 'lucide-react';

function AboutUs() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 sm:p-12 shadow-lg border border-primary-200">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center gap-3">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F521006238d0c488b88ea924156fa8e07%2F99f3a89b07dd47cebd53e1166682c659?format=webp&width=800" alt="Nexus Group" className="h-12 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nexus Group</h1>
            <p className="text-primary-700 text-sm sm:text-base">Professional software developers</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F521006238d0c488b88ea924156fa8e07%2F99f3a89b07dd47cebd53e1166682c659?format=webp&width=800" alt="Nexus Group" className="h-16 object-contain" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Nexus Group</h1>
            <p className="text-primary-700 text-lg">Professional software developers</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrator</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">Namra Acharya</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="text-lg font-semibold text-gray-900">Nexus Group</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <a href="mailto:nexushelpus@gmail.com" className="text-lg font-semibold text-primary-600 hover:underline">
                nexushelpus@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* About the System */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About HIMS</h2>
          <p className="text-gray-700 leading-relaxed">
            The Hospital Information Management System is a professional-grade solution designed to streamline hospital operations,
            patient management, and healthcare delivery. Built with modern technology and offline support capabilities,
            it ensures seamless operations even in challenging network conditions.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Zap size={24} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Offline Support</h3>
          </div>
          <p className="text-sm text-gray-600">Work seamlessly even without internet connection with automatic sync when online.</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-success" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Complete Management</h3>
          </div>
          <p className="text-sm text-gray-600">Manage patients, doctors, nurses, billing, and more from one unified platform.</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Heart size={24} className="text-secondary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Patient Care Focused</h3>
          </div>
          <p className="text-sm text-gray-600">Comprehensive patient records, vitals tracking, and healthcare documentation.</p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Mail size={24} className="text-primary-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:nexushelpus@gmail.com" className="text-primary-600 hover:underline font-medium">
                nexushelpus@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-gray-600 py-4">
        <p className="text-sm">HIMS v1.0 © 2024 Nexus Group. All rights reserved.</p>
      </div>
    </div>
  );
}

export default AboutUs;
