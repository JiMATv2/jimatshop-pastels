/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (cfg: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export {};
