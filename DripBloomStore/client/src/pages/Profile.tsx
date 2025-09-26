import { useTelegram } from "@/hooks/use-telegram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isSupported } = useTelegram();
  const [, setLocation] = useLocation();

  return (
    <div className="px-4 py-6" data-testid="page-profile">
      <div className="container mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-6" data-testid="text-profile-title">
          Профиль
        </h1>

        {isSupported ? (
          <Card className="rounded-[20px] shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-blue-500"
                >
                  <path
                    d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
                    fill="currentColor"
                  />
                </svg>
                <span>Аккаунт Telegram</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3" data-testid="telegram-user-details">
                  <div>
                    <p className="text-sm text-muted-foreground">Имя</p>
                    <p className="font-medium" data-testid="text-user-name">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  {user.username && (
                    <div>
                      <p className="text-sm text-muted-foreground">Пользователь</p>
                      <p className="font-medium" data-testid="text-user-username">
                        @{user.username}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">ID пользователя</p>
                    <p className="font-mono text-sm" data-testid="text-user-id">
                      {user.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4" data-testid="no-telegram-user">
                  <p className="text-muted-foreground">Не подключен к Telegram</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-[20px] shadow-lg mb-6">
            <CardContent className="pt-6">
              <div className="text-center" data-testid="telegram-not-supported">
                <p className="text-muted-foreground mb-4">
                  Это приложение лучше всего работает через Telegram
                </p>
                <p className="text-sm text-muted-foreground">
                  Откройте эту ссылку в чате Telegram для доступа ко всем функциям
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-3 rounded-[16px]"
            onClick={() => setLocation("/favorites")}
            data-testid="button-view-favorites"
          >
            Посмотреть избранное
          </Button>
          
          <Button
            variant="outline"
            className="w-full py-3 rounded-[16px]"
            onClick={() => setLocation("/cart")}
            data-testid="button-view-cart"
          >
            Посмотреть корзину
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Drip Bloom - Стеклянные кольца ручной работы</p>
          <p>Версия 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
