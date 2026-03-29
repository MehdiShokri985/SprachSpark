import json

with open("json/verbs_A1_New.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for i, item in enumerate(data, start=1):
    item["Filename"] = str(i) 

with open("output1.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)