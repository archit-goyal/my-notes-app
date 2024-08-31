// app/page.tsx
'use client'

import { useEffect, useState } from 'react';
import app from '@/src/firebase/firebaseApp';

export default function Home() {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (app) {
      setIsFirebaseInitialized(true);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to My Notes App</h1>
      {isFirebaseInitialized ? (
        <p>Firebase is initialized successfully!</p>
      ) : (
        <p>Firebase initialization failed. Check your configuration.</p>
      )}
    </main>
  );
}