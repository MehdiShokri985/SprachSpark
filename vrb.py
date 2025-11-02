
import json

# نام فایل ورودی و خروجی
input_file = './json/json-verb-A2.json'  # فایل JSON ورودی (آرایه‌ای از آبجکت‌ها)
output_file = 'output.json'  # فایل JSON خروجی

# خواندن فایل JSON
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# فرض بر این است که data یک لیست (آرایه) از دیکشنری‌هاست
if isinstance(data, list):
    for i, item in enumerate(data):
        if isinstance(item, dict) and 'Filename' in item:
            item['Filename'] = str(i + 1)  # آپدیت از 1 شروع شود

    # ذخیره در فایل جدید
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"فایل آپدیت شده در {output_file} ذخیره شد.")
else:
    print("فایل JSON باید یک آرایه (لیست) از آبجکت‌ها باشد.")