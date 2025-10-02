import json

# فایل ورودی
with open("./json/json-A2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# فیلتر کردن فقط مواردی که جمله نیستند
words_only = [item for item in data if item.get("type") != "جمله"]

# ذخیره در فایل جدید
with open("json-worter-A2.json", "w", encoding="utf-8") as f:
    json.dump(words_only, f, ensure_ascii=False, indent=2)

print("✅ فایل json-worter-A2.json ساخته شد.")
