import { useState } from 'react';

const Home = () => {
  const [printData, setPrintData] = useState('');
  const [status, setStatus] = useState('');

  const sendPrintJob = async () => {
    try {
      const response = await fetch('http://localhost:5000/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: printData }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('Print job completed successfully!');
      } else {
        setStatus(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending print job:', error);
      setStatus('Failed to connect to the backend.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Printer Test</h1>
      <textarea
        rows={5}
        cols={40}
        placeholder="Enter text to print"
        value={printData}
        onChange={(e) => setPrintData(e.target.value)}
      ></textarea>
      <button onClick={sendPrintJob} style={{ marginTop: '10px' }}>
        Print
      </button>
      <div>{status && <p>{status}</p>}</div>
    </div>
  );
};

export default Home;
