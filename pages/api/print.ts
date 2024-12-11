import { NextApiRequest, NextApiResponse } from 'next';
import escpos from 'escpos';
import { USB } from 'escpos-usb';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { vendorId, productId, data } = req.body;

  try {
    // Connect to the selected USB printer
    const device:any = new USB(parseInt(vendorId, 16), parseInt(productId, 16));
    const options = { encoding: 'GB18030' }; // Adjust encoding if necessary
    const printer = new escpos.Printer(device, options);

    device.open(() => {
      data.forEach((line: string) => printer.text(line)); // Print each line
      printer.cut();
      printer.close();
      res.status(200).send('Printed successfully');
    });
  } catch (error:any) {
    console.error('Error printing:', error);
    res.status(500).json({ error: 'Failed to print', details: error.message });
  }
}
