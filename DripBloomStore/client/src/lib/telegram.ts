interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    [key: string]: any;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  sendData: (data: string) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

class TelegramService {
  private webApp: TelegramWebApp | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
    }
  }

  isSupported(): boolean {
    return this.webApp !== null;
  }

  ready(): void {
    if (this.webApp) {
      this.webApp.ready();
    }
  }

  close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  expand(): void {
    if (this.webApp) {
      this.webApp.expand();
    }
  }

  sendData(data: string): void {
    if (this.webApp) {
      this.webApp.sendData(data);
    }
  }

  get initDataUnsafe() {
    return this.webApp?.initDataUnsafe;
  }

  get MainButton() {
    return this.webApp?.MainButton;
  }
}

export const telegram = new TelegramService();
