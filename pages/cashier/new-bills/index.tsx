import { useState } from 'react';

const Home = () => {
  const [printer, setPrinter] = useState<USBDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [printData, setPrintData] = useState('');

  const connectPrinter = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] });
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);
      setPrinter(device);
      setIsConnected(true);
      alert(`Connected to printer: ${device.productName}`);
    } catch (error) {
      console.error('Error connecting to printer:', error);
      alert('Failed to connect to the printer. Make sure it’s compatible.');
    }
  };

  const print = async () => {
    if (!printer) {
      alert('No printer connected');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(printData + '\n'); // Convert text to binary data
      await printer.transferOut(1, data); // Transfer data to the printer
      alert('Print successful!');
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to print. Check printer connection.');
    }
  };

  const disconnectPrinter = async () => {
    if (printer) {
      await printer.close();
      setPrinter(null);
      setIsConnected(false);
      alert('Printer disconnected.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>WebUSB Printer Test</h1>
      <div>
        {!isConnected ? (
          <button onClick={connectPrinter}>Connect to Printer</button>
        ) : (
          <button onClick={disconnectPrinter}>Disconnect Printer</button>
        )}
      </div>
      {isConnected && (
        <div style={{ marginTop: '20px' }}>
          <textarea
            rows={5}
            cols={40}
            placeholder="Enter text to print"
            value={printData}
            onChange={(e) => setPrintData(e.target.value)}
          ></textarea>
          <button onClick={print} style={{ marginTop: '10px' }}>
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
