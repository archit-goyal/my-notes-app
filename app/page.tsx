// app/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { app as firebaseApp } from '@/src/firebase/firebaseApp';
import Notes from '@/components/Notes';

export default function Home() {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (firebaseApp) {
      setIsFirebaseInitialized(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      {isFirebaseInitialized ? (
        <Notes />
      ) : (
        <p className="text-center p-4">Firebase initialization failed. Check your configuration.</p>
      )}
    </main>
  );
}