// app/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { app as firebaseApp } from '@/src/firebase/firebaseApp';
import Notes from '@/components/Notes';
import SideNav from '@/components/SideNav';
import '@/components/RichTextEditor.css';  // Import the CSS here

export default function Home() {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (firebaseApp) {
      setIsFirebaseInitialized(true);
    }
  }, []);

  return (
    <div className="flex">
      <SideNav />
      <main className="flex-1 ml-64 p-4 bg-gray-100 min-h-screen">
        {isFirebaseInitialized ? (
          <Notes />
        ) : (
          <p className="text-center p-4">Firebase initialization failed. Check your configuration.</p>
        )}
      </main>
    </div>
  );
}