import json

# مسیر فایل JSON ورودی
input_file = "json-All-tense-verb-A2.json"
# مسیر فایل JSON خروجی
output_file = "output.json"

# خواندن فایل JSON ورودی
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# استخراج فقط کلیدهای مورد نظر
new_data = []
for item in data:
    new_item = {
        " ": item.get("Präsens"),
   
    }
    new_data.append(new_item)

# ذخیره در فایل JSON جدید
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print(f"فایل جدید با موفقیت ساخته شد: {output_file}")
