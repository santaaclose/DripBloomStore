import { useState, useEffect } from "react";
import { telegram } from "@/lib/telegram";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (telegram.isSupported()) {
      setIsSupported(true);
      telegram.ready();
      
      const telegramUser = telegram.initDataUnsafe?.user;
      if (telegramUser) {
        setUser(telegramUser);
      }
    }
  }, []);

  const sendData = (data: string) => {
    if (telegram.isSupported()) {
      telegram.sendData(data);
    }
  };

  const close = () => {
    if (telegram.isSupported()) {
      telegram.close();
    }
  };

  const expand = () => {
    if (telegram.isSupported()) {
      telegram.expand();
    }
  };

  return {
    user,
    isSupported,
    sendData,
    close,
    expand,
  };
}
