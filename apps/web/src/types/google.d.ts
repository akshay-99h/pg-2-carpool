export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              shape?: string;
              text?: string;
              width?: string | number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}
