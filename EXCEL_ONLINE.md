# Excel Online без ПК (личный аккаунт Microsoft)

## Почему «Saved to OneDrive» не обновляет сайт сразу

У **личного** аккаунта Microsoft (`@outlook.com`, `@gmail.com` через Microsoft):

- Excel Online сохраняет **сессию**, а файл `.xlsx` в OneDrive обновляется **не сразу**
- API «живых ячеек» (Graph Workbook) **не работает** для личных аккаунтов
- Сайт читает **файл** из OneDrive — пока файл не обновился, данные на сайте старые

Это ограничение **Microsoft**, не Render и не наш код.

---

## Решение: Power Automate (облако, без вашего ПК)

Когда файл в OneDrive **реально изменился**, облако Microsoft само отправит его на Render.

### Что нужно

1. На Render в **Environment**:
   - `SYNC_SECRET` = `HydroAir-Sync-9266-2026` (или свой длинный пароль)
2. Код с `/api/excel/sync` задеплоен на Render (git push)
3. Бесплатный аккаунт [Power Automate](https://make.powerautomate.com)

### Шаги в Power Automate

1. Откройте [make.powerautomate.com](https://make.powerautomate.com) → войдите тем же Microsoft-аккаунтом
2. **Create** → **Automated cloud flow**
3. Имя: `Excel to HydroAir`
4. Триггер: **When a file is modified (properties only)** / **Когда изменяется файл (только свойства)**
   - Папка: OneDrive → файл **`eco clim himnakan.xlsx`**
5. **+ New step** → **Get file content** / **Получить содержимое файла**
   - Файл: тот же `eco clim himnakan.xlsx`
6. **+ New step** → **HTTP** → **HTTP POST**
   - URI: `https://hydroair-systems.onrender.com/api/excel/sync`
   - Headers:
     - `X-Sync-Secret` = ваш `SYNC_SECRET` с Render
     - `Content-Type` = `application/octet-stream`
   - Body: **File Content** из шага 5 (динамическое содержимое)
7. **Save** → включите flow

### Как пользоваться Excel Online

1. Откройте файл на [onedrive.live.com](https://onedrive.live.com) → **Открыть в браузере**
2. Измените ячейки
3. Дождитесь **Saved to OneDrive**
4. **Закройте вкладку** Excel Online (важно!)
5. Через 1–2 минуты Power Automate отправит файл на сайт
6. На сайте в статусе: **(источник: синхронизация с ПК)** — это значит файл пришёл через sync (можно переименовать в «облачная синхронизация»)

---

## Проверка

После настройки Power Automate:

```
https://hydroair-systems.onrender.com/api/excel/sync-status
```

Должно быть `"hasData": true` и свежее `"uploadedAt"`.

---

## Если нужно мгновенно (каждая ячейка)

Только с **рабочим/учебным** аккаунтом Microsoft 365 (не личный `@outlook.com`):

- Graph Workbook API → живые ячейки
- Нужен Azure AD tenant (можно Microsoft 365 Business)

Для личного аккаунта Microsoft **мгновенной** синхронизации ячеек из Excel Online **не существует**.

---

## Кратко

| Способ | ПК нужен? | Excel Online? | Скорость |
|--------|-----------|---------------|----------|
| Только Graph (как сейчас) | Нет | Да | Медленно / часто не обновляется |
| **Power Automate** | **Нет** | **Да** | 1–2 мин после сохранения файла |
| Скрипт sync на ПК | Да | Нет (Excel на ПК) | ~30 сек |

**Рекомендация для Excel Online без ПК:** настройте **Power Automate** по инструкции выше.
