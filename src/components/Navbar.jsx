import React from 'react';

function Navbar() {

  return (
    <nav className="bg-gradient-to-r from-white to-primary-50 shadow-md border-b-2 border-primary-200 px-6 py-[18px] flex items-center justify-between z-40 w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md">
          <span className="text-lg font-bold">🏥</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">HIMS</h1>
          <span className="text-xs text-medical-600 font-semibold">Hospital Information Management</span>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;
