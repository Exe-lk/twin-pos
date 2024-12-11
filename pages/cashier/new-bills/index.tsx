import { useEffect, useState } from 'react';

const Home = () => {
  const [isQzReady, setIsQzReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
    script.async = true;

    script.onload = () => {
      console.log('QZ Tray script loaded.');
      setIsQzReady(true);
    };

    script.onerror = () => {
      console.error('Failed to load QZ Tray script.');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePrint = async () => {
    if (!isQzReady || typeof window.qz === 'undefined') {
      console.error('QZ Tray is not ready.');
      alert('QZ Tray is not loaded yet. Please try again later.');
      return;
    }

    try {
      if (!window.qz.websocket.isActive()) {
        await window.qz.websocket.connect();
      }

      const config = window.qz.configs.create('XP-58');
      const data = [
        '\x1B\x40', // Initialize printer
        'Hello, World!\n',
        'Hello, World!\n',
        'Hello, World!\n',
        '\x1D\x56\x41', // Cut paper
      ];

      await window.qz.print(config, data);
      alert('Printed successfully!');
    } catch (error) {
      console.error('Printing failed', error);
    }
  };

  return (
    <div>
      <h1>Print Page</h1>
      <button onClick={handlePrint}>Print</button>
    </div>
  );
};

export default Home;
