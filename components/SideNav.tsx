// components/SideNav.tsx

import React, { useState } from 'react';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-20 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <nav className={`w-64 bg-gray-100 h-screen fixed left-0 top-0 p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-10`}>
        <div className="text-2xl font-bold mb-8 text-black">MyNotes</div>
        <ul>
          <NavItem icon="📝" text="Notes" />
          <NavItem icon="🔔" text="Reminders" />
          <NavItem icon="🏷️" text="Edit labels" />
          <NavItem icon="📦" text="Archive" />
          <NavItem icon="🗑️" text="Trash" />
        </ul>
      </nav>
    </>
  );
}

function NavItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="mb-2">
      <a href="#" className="flex items-center text-gray-700 hover:bg-gray-200 p-2 rounded transition duration-200">
        <span className="mr-2">{icon}</span> {text}
      </a>
    </li>
  );
}