import json

# مسیر فایل ورودی
input_file = "json/json-verb-A1.json"

# مسیر فایل خروجی
output_file = "verbs_list.json"

result = []

# خواندن فایل JSON
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# اگر فایل شامل لیست از آبجکت‌ها باشد
for item in data:
    sound_de = item.get("Sound_de", "")
    
    if sound_de:
        # گرفتن اولین کلمه قبل از -
        first_word = sound_de.split("-")[0].strip()
        result.append(first_word)

# ذخیره خروجی
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("✅ استخراج انجام شد و در فایل ذخیره شد.")