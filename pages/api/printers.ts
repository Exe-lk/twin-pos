import { NextApiRequest, NextApiResponse } from 'next';
import HID from 'node-hid';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const devices = HID.devices().filter((device) => device.product?.includes('Printer'));
  res.status(200).json(devices);
}
