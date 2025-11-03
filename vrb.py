import json

# مسیر فایل‌ها
source_file = "output1 copy.json"
target_file = "json-verb-A2.json"

# خواندن فایل‌ها
with open(source_file, "r", encoding="utf-8") as f:
    source_data = json.load(f)

with open(target_file, "r", encoding="utf-8") as f:
    target_data = json.load(f)

# تبدیل source به دیکشنری برای دسترسی سریع
source_dict = {item["Filename"]: item for item in source_data}

# آپدیت کردن فایل دوم
for item in target_data:
    filename = item.get("Filename")
    if filename in source_dict:
        item["Sound_de"] = source_dict[filename].get("Sound_de", item.get("Sound_de"))
        item["translate_fa"] = source_dict[filename].get("translate_fa", item.get("translate_fa"))

# ذخیره فایل آپدیت شده
with open(target_file, "w", encoding="utf-8") as f:
    json.dump(target_data, f, ensure_ascii=False, indent=4)

print("✅ فایل دوم با موفقیت آپدیت شد.")
