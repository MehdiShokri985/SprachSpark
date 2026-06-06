import json

# مسیر فایل JSON ورودی
input_file = "germany_app/json/präpositionen.json"
# مسیر فایل JSON خروجی
output_file = "präpositionen_list.json"

# خواندن فایل JSON ورودی
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# استخراج فقط کلیدهای مورد نظر
new_data = []
for item in data:
    new_item = {
        "word": item.get("word"),
   
    }
    new_data.append(new_item)

# ذخیره در فایل JSON جدید
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print(f"فایل جدید با موفقیت ساخته شد: {output_file}")
