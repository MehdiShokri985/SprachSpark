import json

def replace_root_by_sound_de(file1_path, file2_path, output_path):
    # خواندن فایل اول
    with open(file1_path, 'r', encoding='utf-8') as f:
        data1 = json.load(f)

    # خواندن فایل دوم
    with open(file2_path, 'r', encoding='utf-8') as f:
        data2 = json.load(f)

    # ساخت یک دیکشنری برای دسترسی سریع به فایل دوم بر اساس Sound_de
    map2 = {item["Sound_de"]: item for item in data2}

    # پردازش و جایگزینی root
    for obj in data1:
        sound = obj.get("Sound_de")
        if sound in map2:
            obj["root"] = map2[sound].get("root", obj.get("root"))

    # ذخیره خروجی
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data1, f, ensure_ascii=False, indent=4)

    print("Done! Output saved to", output_path)


# مثال استفاده:
replace_root_by_sound_de("json.json", "t.json", "output.json")
