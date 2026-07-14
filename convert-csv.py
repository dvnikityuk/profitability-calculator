#!/usr/bin/env python3
"""
Конвертер CSV → JSON для калькулятора рентабельности.

Читает два CSV-файла из Google Sheets:
  - Прайс-лист (содержит цены по регионам)
  - TVC-список (содержит целевую себестоимость, общую для всех регионов)

Генерирует data/api-data.json для использования в index.html.

Использование:
  python3 scripts/convert-csv.py [--price ФАЙЛ] [--tvc ФАЙЛ] [--output ФАЙЛ]

По умолчанию:
  --price  sample-data/Кальлятор РМ Прайс.csv
  --tvc    sample-data/Кальлятор РМ TVC.csv
  --output data/api-data.json
"""

import csv
import json
import os
import argparse
import sys


def parse_number(val: str) -> float:
    """Парсит число из CSV. Поддерживает точку и запятую как разделитель."""
    if not val or not val.strip():
        return 0.0
    val = val.strip().replace('\xa0', '').replace(' ', '')
    # Запятая как десятичный разделитель (европейский формат)
    if ',' in val and '.' not in val:
        val = val.replace(',', '.')
    # Запятая как тысячный разделитель (1,769.00)
    elif ',' in val and '.' in val:
        val = val.replace(',', '')
    try:
        return float(val)
    except ValueError:
        return 0.0


def read_price_csv(path: str) -> dict:
    """Читает CSV с ценами. Возвращает dict: (region, code) -> {class, short, full, price}"""
    items = {}
    with open(path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        # Пробуем разделитель ; если заголовок не распознался, попробуем ,
        if not reader.fieldnames or 'Прайс' not in (reader.fieldnames or []):
            f.seek(0)
            reader = csv.DictReader(f, delimiter=',')

        for row in reader:
            region = row.get('Прайс', '').strip()
            cls = row.get('Класс ТМЦ', '').strip()
            short = row.get('ТМЦ кратко', '').strip()
            full = row.get('ТМЦ', '').strip()
            code = row.get('Код', '').strip()
            price = parse_number(row.get('Цена', '0'))

            if not region or not code:
                continue

            key = (region, code)
            items[key] = {
                'r': region,
                'c': cls,
                's': short,
                't': full,
                'k': code,
                'p': price,
            }

    return items


def read_tvc_csv(path: str) -> dict:
    """Читает CSV с TVC. Возвращает dict: code -> tvc_value"""
    tvc_map = {}
    with open(path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        if not reader.fieldnames or 'TVC' not in (reader.fieldnames or []):
            f.seek(0)
            reader = csv.DictReader(f, delimiter=',')

        for row in reader:
            code = row.get('Код', '').strip()
            tvc = parse_number(row.get('TVC', '0'))
            if code:
                tvc_map[code] = tvc

    return tvc_map


def merge(price_items: dict, tvc_map: dict) -> dict:
    """Объединяет цены и TVC, формирует финальную структуру JSON."""
    regions = sorted(set(item['r'] for item in price_items.values()))
    classes_set = set()
    products = []

    for key, item in price_items.items():
        region, code = key
        cls = item['c']
        if cls:
            classes_set.add(cls)

        tvc = tvc_map.get(code, 0.0)

        products.append({
            'r': item['r'],
            'c': item['c'],
            's': item['s'],
            't': item['t'],
            'k': item['k'],
            'p': item['p'],
            'v': tvc,
        })

    classes = sorted(classes_set)

    return {
        'regions': regions,
        'classes': classes,
        'products': products,
    }


def main():
    parser = argparse.ArgumentParser(description='Конвертер CSV → JSON для калькулятора рентабельности')
    parser.add_argument('--price', default='sample-data/Кальлятор РМ Прайс.csv',
                        help='Путь к CSV-файлу с ценами')
    parser.add_argument('--tvc', default='sample-data/Кальлятор РМ TVC.csv',
                        help='Путь к CSV-файлу с TVC')
    parser.add_argument('--output', default='data/api-data.json',
                        help='Путь к выходному JSON-файлу')
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    price_path = os.path.join(base_dir, args.price) if not os.path.isabs(args.price) else args.price
    tvc_path = os.path.join(base_dir, args.tvc) if not os.path.isabs(args.tvc) else args.tvc
    output_path = os.path.join(base_dir, args.output) if not os.path.isabs(args.output) else args.output

    # Проверяем существование файлов
    if not os.path.isfile(price_path):
        print(f'Ошибка: файл цен не найден: {price_path}', file=sys.stderr)
        print(f'Укажите путь: python3 scripts/convert-csv.py --price /путь/к/прайс.csv', file=sys.stderr)
        sys.exit(1)
    if not os.path.isfile(tvc_path):
        print(f'Ошибка: файл TVC не найден: {tvc_path}', file=sys.stderr)
        print(f'Укажите путь: python3 scripts/convert-csv.py --tvc /путь/к/tvc.csv', file=sys.stderr)
        sys.exit(1)

    print(f'Чтение цен: {price_path}')
    price_items = read_price_csv(price_path)
    print(f'  Найдено записей: {len(price_items)}')

    print(f'Чтение TVC: {tvc_path}')
    tvc_map = read_tvc_csv(tvc_path)
    print(f'  Найдено записей: {len(tvc_map)}')

    data = merge(price_items, tvc_map)

    # Создаём директорию для вывода
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    size_kb = os.path.getsize(output_path) / 1024
    print(f'\nГотово: {output_path}')
    print(f'  Регионы: {", ".join(data["regions"])}')
    print(f'  Классов: {len(data["classes"])}')
    print(f'  Продуктов: {len(data["products"])}')
    print(f'  Размер: {size_kb:.1f} КБ')


if __name__ == '__main__':
    main()