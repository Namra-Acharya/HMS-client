import React from 'react';

function Navbar() {

  return (
    <nav className="bg-gradient-to-r from-white to-primary-50 shadow-md border-b-2 border-primary-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between z-40 w-full">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md flex-shrink-0">
          <span className="text-base sm:text-lg font-bold">🏥</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">HIMS</h1>
          <span className="text-xs text-medical-600 font-semibold hidden sm:block">Hospital Information Management</span>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;
