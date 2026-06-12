# Настройка Microsoft входа (для Excel Online)

Публичные ссылки OneDrive **больше не работают** без входа. Нужен **один раз** войти в Microsoft.

## 1. Создайте приложение в Azure

1. Откройте [https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
2. **New registration**
3. Name: `AquaPrime`
4. **Supported account types:** `Personal Microsoft accounts only`
5. Redirect URI: оставьте пустым
6. **Register** → скопируйте **Application (client) ID**

## 2. Включите Device Code

1. В приложении → **Authentication**
2. **Advanced settings** → **Allow public client flows** → **Yes**
3. Save

## 3. Разрешения API

1. **API permissions** → Add permission → Microsoft Graph → Delegated:
   - `Files.Read`
   - `User.Read`
   - `offline_access`
2. Grant admin consent (если кнопка есть)

## 4. В `server/.env`

```
MS_TENANT_ID=consumers
MS_CLIENT_ID=ваш_новый_client_id
MS_CLIENT_SECRET=
EXCEL_ITEM_ID=c258993c-1dcd-417e-9f18-e91d135f7b59
```

**Не используйте client secret** для device login — оставьте пустым.

## 5. Войдите один раз

1. Перезапустите сервер
2. Откройте: **http://localhost:4000/ms-login**
3. Нажмите «Получить код» → введите код на microsoft.com/devicelogin
4. Проверка: **http://localhost:4000/api/excel/share-test** → `"ok": true`

## 6. Для Render (облако)

Скопируйте содержимое `server/.auth-tokens.json` в переменную окружения:

```
MS_AUTH_TOKENS_JSON={"accessToken":"...","refreshToken":"...","expiresAt":...,"account":{...}}
```

Или снова откройте `https://ваш-сайт.onrender.com/ms-login` после деплоя.
