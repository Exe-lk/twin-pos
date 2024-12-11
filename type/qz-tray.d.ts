declare namespace qz {
    const websocket: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      isActive: () => boolean;
    };
  
    const configs: {
      create: (printerName: string) => any;
    };
  
    const print: (config: any, data: string[]) => Promise<void>;
  }