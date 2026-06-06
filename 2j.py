import json

# ================== تنظیمات ==================
# نام فایل‌ها را اینجا تنظیم کنید
file1_path = 'germany_app/json/präpositionen.json'      # فایل اصلی (شیءهای کامل)
file2_path = 'präpositionen_list.json'      # فایل دوم (word + case)
output_path = 'präpositionen_updated.json'  # فایل خروجی
# =============================================

# خواندن فایل اول
with open(file1_path, 'r', encoding='utf-8') as f:
    verbs_full = json.load(f)

# خواندن فایل دوم
with open(file2_path, 'r', encoding='utf-8') as f:
    verbs_case = json.load(f)

# ساخت دیکشنری برای جستجوی سریع
case_dict = {item['word']: item.get('pronunciation') for item in verbs_case}

updated_count = 0
not_found = []

# اضافه کردن کلید case به هر شیء
for verb in verbs_full:
    word = verb.get('word')
    if word in case_dict and case_dict[word] is not None:
        verb['pronunciation'] = case_dict[word]
        updated_count += 1
    else:
        not_found.append(word)

# ذخیره فایل خروجی
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(verbs_full, f, ensure_ascii=False, indent=2)

# نمایش نتیجه
print(f"✅ عملیات با موفقیت انجام شد!")
print(f"تعداد فعل‌های به‌روزرسانی شده: {updated_count}")
print(f"تعداد فعل‌هایی که پیدا نشدند: {len(not_found)}")

if not_found:
    print("\nفعل‌هایی که پیدا نشدند:")
    for w in not_found[:30]:
        print(f"   - {w}")