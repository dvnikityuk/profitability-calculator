# 📤 Инструкция по публикации на GitHub Pages

## 🎯 Что такое GitHub Pages?

**GitHub Pages** — это бесплатный хостинг для статических сайтов прямо из вашего GitHub-репозитория. Идеально подходит для React/Vite приложений.

---

## 📋 Предварительные требования

1. ✅ Учетная запись на [GitHub.com](https://github.com)
2. ✅ Установленный Git на компьютере
3. ✅ Node.js и npm (уже установлены в проекте)

---

## 🚀 Пошаговая инструкция

### Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на [github.com](https://github.com)
2. Нажмите **«+»** → **«New repository»**
3. Заполните данные:
   - **Repository name**: `profitability-calculator` (или любое другое имя)
   - **Description**: «Калькулятор рентабельности продаж РМ»
   - **Visibility**: Public (публичный) или Private (приватный)
   - ❌ **Не ставьте** галочки «Initialize with README», «.gitignore», «License»
4. Нажмите **«Create repository»**

---

### Шаг 2: Инициализируйте Git в проекте

Откройте терминал в папке проекта и выполните команды:

```bash
# Инициализация Git репозитория
git init

# Добавляем все файлы
git add .

# Делаем первый коммит
git commit -m "Initial commit: profitability calculator"
```

---

### Шаг 3: Свяжите локальный репозиторий с GitHub

В терминале выполните (замените `YOUR_USERNAME` на ваш логин GitHub):

```bash
# Добавляем удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/profitability-calculator.git

# Переименовываем ветку в main
git branch -M main

# Отправляем код на GitHub
git push -u origin main
```

> 💡 **Важно**: Если используете Private репозиторий, GitHub запросит логин и пароль. Для пароля используйте **Personal Access Token** (создается в настройках GitHub).

---

### Шаг 4: Настройте GitHub Pages

1. Зайдите в ваш репозиторий на GitHub
2. Перейдите во вкладку **«Settings»** (Настройки)
3. В левом меню выберите **«Pages»**
4. В разделе **«Build and deployment»**:
   - **Source**: Выберите `Deploy from a branch`
   - **Branch**: Выберите `gh-pages` и папку `/ (root)`
   - Нажмите **«Save»**

> ⏳ После сохранения GitHub покажет ссылку вида:  
> `https://YOUR_USERNAME.github.io/profitability-calculator/`  
> Сайт будет доступен через 1-3 минуты после деплоя.

---

### Шаг 5: Задеплойте проект

В терминале выполните команду:

```bash
npm run deploy
```

Эта команда:
1. ✅ Сначала запустит `npm run build` (создаст оптимизированную сборку в папке `dist`)
2. ✅ Затем опубликует содержимое `dist` в ветку `gh-pages`

Вы увидите вывод примерно такой:
```
> predeploy
> npm run build

> deploy
> gh-pages -d dist

Published
```

---

### Шаг 6: Проверьте результат

1. Откройте ссылку, которую показал GitHub Pages (из Шага 4)
2. Ваш калькулятор должен работать!

---

## 🔄 Как обновить сайт после изменений

После любых изменений в коде:

```bash
# 1. Сохраните изменения в Git
git add .
git commit -m "Описание изменений"
git push origin main

# 2. Задеплойте обновленную версию
npm run deploy
```

> 💡 Можно объединить в одну команду:
> ```bash
> git add . && git commit -m "Update" && git push origin main && npm run deploy
> ```

---

## ⚙️ Дополнительные настройки

### Изменение имени репозитория

Если переименуете репозиторий, обновите remote:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/NEW_NAME.git
```

### Использование Custom Domain

Если хотите свой домен (например, `calc.yoursite.com`):

1. В настройках GitHub Pages (**Settings → Pages**)
2. В разделе **«Custom domain»** введите ваш домен
3. Добавьте файл `CNAME` в корень репозитория с именем домена
4. Настройте DNS записи у вашего регистратора домена

---

## 🐛 Решение проблем

### ❌ Ошибка «Permission denied» при пуше

**Решение**: Используйте Personal Access Token вместо пароля:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Создайте токен с правами `repo`
3. Используйте его вместо пароля при пуше

### ❌ Сайт не обновляется после деплоя

**Решение**:
1. Очистите кэш браузера (Ctrl+Shift+R / Cmd+Shift+R)
2. Проверьте вкладку **Actions** на GitHub — возможно сборка еще идет
3. Убедитесь что ветка `gh-pages` существует: `git branch -a`

### ❌ Ошибка «404 Not Found»

**Причины**:
- Ветка `gh-pages` еще не создана (запустите `npm run deploy`)
- Неправильный **base path** в `vite.config.ts` (должен быть `"./"`)
- GitHub Pages еще не обновился (подождите 2-3 минуты)

### ❌ Белый экран после загрузки

**Проверьте**:
1. Откройте консоль браузера (F12)
2. Посмотрите на ошибки
3. Частая причина: неправильный `base` в `vite.config.ts`

---

## 📊 Структура после деплоя

```
profitability-calculator/
├── main/              # Исходный код (ветка main)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── gh-pages/          # Сбилженный сайт (ветка gh-pages)
    └── index.html     # Единственный файл (благодаря vite-plugin-singlefile)
```

> 💡 Благодаря плагину `vite-plugin-singlefile`, весь проект упаковывается в **один HTML-файл**, что упрощает хостинг.

---

## 🎁 Бонус: Автоматический деплой через GitHub Actions

Если хотите автоматический деплой при каждом пуше в `main`:

1. Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. В **Settings → Pages** выберите **Source: GitHub Actions**
3. Теперь при каждом пуше в `main` сайт будет обновляться автоматически!

---

## 📞 Полезные ссылки

- [Официальная документация GitHub Pages](https://docs.github.com/en/pages)
- [Vite документация](https://vitejs.dev/)
- [gh-pages npm пакет](https://www.npmjs.com/package/gh-pages)

---

## ✅ Чек-лист перед публикацией

- [ ] Код протестирован локально (`npm run build` проходит без ошибок)
- [ ] Все файлы загружены в Git
- [ ] Репозиторий создан на GitHub
- [ ] Ветка `gh-pages` настроена в настройках Pages
- [ ] Команда `npm run deploy` выполнена успешно
- [ ] Сайт открывается по ссылке GitHub Pages

---

**Готово!** 🎉 Ваш калькулятор рентабельности теперь доступен онлайн!
