import escpos, { Printer, USB } from 'escpos';

export const printReceipt = async (data: string[]) => {
  try {
    // Set up USB device (adjust vendorId/productId based on your printer)
    const device = new USB();
    const options = { encoding: "GB18030" }; // Adjust encoding for your region/language
    const printer = new Printer(device, options);

    device.open(() => {
      data.forEach((line) => {
        printer.text(line); // Print each line
      });
      printer.cut();
      printer.close();
    });
  } catch (error) {
    console.error('Error printing receipt:', error);
  }
};
