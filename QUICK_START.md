# 🚀 Шпаргалка по командам

## Локальная разработка

```bash
# Запустить dev-сервер (доступ по http://localhost:5173)
npm run dev

# Собрать проект для продакшена
npm run build

# Предпросмотр собранной версии
npm run preview
```

## Публикация на GitHub Pages

### Первый раз

```bash
# 1. Инициализировать Git
git init
git add .
git commit -m "Initial commit"

# 2. Создать репозиторий на GitHub и подключить
git remote add origin https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ.git
git branch -M main
git push -u origin main

# 3. Задеплоить на GitHub Pages
npm run deploy
```

### Обновление после изменений

```bash
# Быстрое обновление (одной строкой)
git add . && git commit -m "Описание изменений" && git push origin main && npm run deploy

# Или по шагам
git add .
git commit -m "Описание изменений"
git push origin main
npm run deploy
```

## Проверка состояния

```bash
# Показать статус Git
git status

# Показать историю коммитов
git log --oneline

# Показать удаленные репозитории
git remote -v

# Показать ветки
git branch -a
```

## Решение проблем

```bash
# Если деплой не сработал, очистить кэш gh-pages
npx gh-pages-clean

# Принудительный деплой
npm run deploy -- -f

# Откатить последний коммит (если что-то пошло не так)
git reset --hard HEAD~1

# Обновить зависимости
npm update

# Переустановить все зависимости
rm -rf node_modules package-lock.json
npm install
```

## Полезные ссылки

- Репозиторий: https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ
- GitHub Pages: https://ВАШ_ЛОГИН.github.io/ВАШ_РЕПОЗИТОРИЙ/
- Настройки Pages: https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ/settings/pages

---

💡 **Совет**: Добавьте алиасы в `.bashrc` или `.zshrc`:

```bash
alias deploy='git add . && git commit -m "Update" && git push origin main && npm run deploy'
alias dev='npm run dev'
alias build='npm run build'
```

Тогда деплой будет одной командой: `deploy`
