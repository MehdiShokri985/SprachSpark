import json

# خواندن لیست کوچک (Vfa)
with open("t.json", "r", encoding="utf-8") as f:
    vfa_list = json.load(f)

# خواندن لیست بزرگ (صرف افعال)
with open("json/verbs_A1_New.json", "r", encoding="utf-8") as f:
    big_list = json.load(f)

# اضافه کردن Vfa
vfa_dict = {item["Verb"]: item["Vfa"] for item in vfa_list}

for entry in big_list:
    verb = entry.get("Verb")
    if verb in vfa_dict:
        entry["Vfa"] = vfa_dict[verb]

# ذخیره فایل جدید
with open("verbs_full_with_vfa.json", "w", encoding="utf-8") as f:
    json.dump(big_list, f, ensure_ascii=False, indent=2)

print("عملیات با موفقیت انجام شد. فایل جدید ذخیره شد: verbs_full_with_vfa.json")