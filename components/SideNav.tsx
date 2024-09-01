// components/SideNav.tsx

import React, { useState } from 'react';
import { FaBook, FaArchive, FaTrash } from 'react-icons/fa';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-20 md:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <nav className={`w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-10`}>
        <div className="text-2xl font-bold mb-8">MyNotes</div>
        <ul>
          <NavItem icon={<FaBook />} text="Notes" />
          <NavItem icon={<FaArchive />} text="Archive" />
          <NavItem icon={<FaTrash />} text="Trash" />
        </ul>
      </nav>
    </>
  );
}

function NavItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="mb-2">
      <a href="#" className="flex items-center text-gray-300 hover:bg-gray-700 p-2 rounded transition duration-200">
        <span className="mr-2">{icon}</span> {text}
      </a>
    </li>
  );
}