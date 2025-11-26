import json

# مسیر فایل ورودی JSON
input_file = "json/json-A1-Kollokationen.json"

# مسیر فایل خروجی txt
output_file = "non_sentences.txt"

# کاراکترهایی که نشان می‌دهند عبارت یک جمله است
sentence_endings = [".", "!", "?", "…"]

# خواندن فایل JSON
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

non_sentences = []

# بررسی sound_de هر آبجکت
for item in data:
    sound = item.get("Sound_de", "").strip()

    # اگر خالی بود، رد می‌کنیم
    if not sound:
        continue

    # چک: آیا آخر عبارت علامت جمله ندارد؟
    if not any(sound.endswith(end) for end in sentence_endings):
        non_sentences.append(sound)

# ذخیره در فایل txt
with open(output_file, "w", encoding="utf-8") as f:
    for s in non_sentences:
        f.write(s + "\n")

print("تمام شد! موارد غیر جمله در فایل non_sentences.txt ذخیره شد.")
