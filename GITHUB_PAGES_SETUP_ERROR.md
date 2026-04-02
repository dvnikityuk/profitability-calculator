# 🚨 Решение ошибки GitHub Pages

## Ошибка
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled 
and configured to build using GitHub Actions
Error: HttpError: Not Found
```

## Причина
GitHub Pages не был включен в настройках репозитория перед первым запуском workflow.

## ✅ Решение (пошагово)

### Шаг 1: Откройте настройки репозитория
1. Перейдите на главную страницу вашего репозитория на GitHub
2. Нажмите на вкладку **"Settings"** (⚙️ в верхнем меню)

### Шаг 2: Перейдите в раздел Pages
1. В левом меню прокрутите вниз до раздела **"Code and automation"**
2. Нажмите **"Pages"**

### Шаг 3: Включите GitHub Pages
**Это самый важный шаг!**

1. Найдите раздел **"Build and deployment"**
2. В выпадающем списке **"Source"** выберите: **"GitHub Actions"**
   - ⚠️ **НЕ выбирайте** "Deploy from a branch"
   
3. После выбора появится зелёное уведомление:
   > "GitHub Pages is designed to host your personal, organization, or project pages from a GitHub repository"

4. ✅ **Готово!** Pages теперь включены

### Шаг 4: Повторите запуск workflow
1. Перейдите в **"Actions"** (в верхнем меню репозитория)
2. Найдите неудачный запуск workflow (с красным крестиком ❌)
3. Нажмите на него
4. В правом верхнем углу нажмите **"Re-run all jobs"**
5. Подтвердите перезапуск

Или просто сделайте новый commit и push:
- Внесите любое изменение в файл (например, добавьте пробел в README.md)
- Запушьте изменения
- Workflow запустится автоматически

## 🎯 Альтернативное решение (обновить workflow)

Если хотите, чтобы workflow сам включал Pages автоматически, обновите файл `.github/workflows/deploy.yml`:

```yaml
- name: Setup Pages
  uses: actions/configure-pages@v4
  with:
    enablement: true  # ← Добавьте эту строку
```

### Как обновить workflow:

1. Откройте файл `.github/workflows/deploy.yml` в вашем редакторе
2. Найдите строку `uses: actions/configure-pages@v4`
3. Добавьте под ней:
   ```yaml
   with:
     enablement: true
   ```
4. Сохраните, закоммитьте и запушьте

## 📸 Где найти настройку (визуальная подсказка)

```
Репозиторий → Settings → Pages → Build and deployment → Source: [GitHub Actions ▼]
```

Должно выглядеть так:
```
┌─────────────────────────────────────────┐
│ Build and deployment                    │
├─────────────────────────────────────────┤
│ Source                                  │
│ ┌─────────────────────┐                 │
│ │ GitHub Actions    ▼ │                 │
│ └─────────────────────┘                 │
│                                         │
│ ✓ GitHub Pages is designed to host...  │
└─────────────────────────────────────────┘
```

## ❓ Частые вопросы

**Q: Я выбрал "Deploy from a branch", что делать?**
A: Вернитесь в Settings → Pages и смените на "GitHub Actions"

**Q: Не вижу пункт "Pages" в меню**
A: Убедитесь, что у вас есть права администратора репозитория

**Q: Workflow всё ещё падает после включения Pages**
A: Подождите 1-2 минуты после включения, затем перезапустите workflow

**Q: Нужно ли делать это каждый раз?**
A: Нет! Только один раз при первой настройке

## ✅ Проверка успеха

После успешного деплоя:
1. Перейдите в **Actions** → последний запуск должен быть зелёным ✅
2. В **Settings → Pages** вверху появится ссылка:
   > "Your site is live at https://ВАШ_ЛОГИН.github.io/РЕПО/"

3. Перейдите по ссылке — ваш калькулятор работает! 🎉
