import { useState, useEffect } from 'react';
import axios from 'axios';

const index = () => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState<{ vendorId: string; productId: string } | null>(null);
  const [printData, setPrintData] = useState<string>('');

  useEffect(() => {
    // Fetch connected printers on load
    axios.get('/api/printers').then((response) => {
      setPrinters(response.data);
    });
  }, []);

  const handlePrint = async () => {
    if (!selectedPrinter) {
      alert('Please select a printer');
      return;
    }

    try {
      await axios.post('/api/print', {
        vendorId: selectedPrinter.vendorId,
        productId: selectedPrinter.productId,
        data: printData.split('\n'), // Send each line as an array
      });
      alert('Printed successfully!');
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>USB Printer Test</h1>
      <div>
        <label>
          Select Printer:
          <select
            onChange={(e) => {
              const [vendorId, productId] = e.target.value.split('-');
              setSelectedPrinter({ vendorId, productId });
            }}
          >
            <option value="">Select Printer</option>
            {printers.map((printer:any, index) => (
              <option key={index} value={`${printer.vendorId}-${printer.productId}`}>
                {printer.product} (VID: {printer.vendorId}, PID: {printer.productId})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <textarea
          rows={5}
          cols={40}
          placeholder="Enter text to print"
          value={printData}
          onChange={(e) => setPrintData(e.target.value)}
        ></textarea>
      </div>
      <button onClick={handlePrint} style={{ marginTop: '10px' }}>
        Print
      </button>
    </div>
  );
};

export default index;
