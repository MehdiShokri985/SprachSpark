import json

# نام فایل‌ها
file1 = "./json/json-All-tense-verb-A1.json"   # شامل Präsens, Präteritum, Perfekt ...
file2 = "./json/json-verb-A1.json"   # شامل Filename, Sound_de, root ...
output_file = "output.json"

# خواندن فایل‌ها
with open(file1, "r", encoding="utf-8") as f:
    verbs1 = json.load(f)

with open(file2, "r", encoding="utf-8") as f:
    verbs2 = json.load(f)

result = []

# تبدیل لیست اول به دیکشنری برای جستجوی سریع
lookup = {item["Präsens"]: item for item in verbs1}

for item in verbs2:
    sound = item["Sound_de"]   # مثل wohnen
    if sound in lookup:
        v = lookup[sound]
        combined = f'{v["Präsens"]} - {v["Präteritum"]} - {v["Perfekt"]}'
        
        new_item = item.copy()
        new_item["Sound_de"] = combined
        result.append(new_item)
    else:
        result.append(item)

# 🔥 شماره‌گذاری دوباره از 1
for i, item in enumerate(result, start=1):
    item["Filename"] = str(i)

# ذخیره خروجی
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("✅ فایل خروجی با موفقیت ساخته شد →", output_file)