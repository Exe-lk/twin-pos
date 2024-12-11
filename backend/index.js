const express = require('express');
const cors = require('cors');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.post('/print', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content to print' });
  }

  try {
    // Connect to the USB printer
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open((err) => {
      if (err) {
        console.error('Error opening USB device:', err);
        return res.status(500).json({ error: 'Failed to connect to the printer' });
      }

      // Print content
      printer
        .text(content) // Add text
        .cut()         // Cut the paper
        .close();      // Close the connection

      console.log('Print job completed successfully!');
      return res.json({ message: 'Print job completed successfully!' });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to print' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Printer backend is running at http://localhost:${port}`);
});
