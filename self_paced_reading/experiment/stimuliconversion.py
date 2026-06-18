import pandas as pd
import json
import re
import os
 

INPUT_FILE = "StimuliSPR.xlsx"
 
# Automatically generate output file name
base_name = os.path.splitext(INPUT_FILE)[0]
OUTPUT_FILE = base_name + ".json"
 
# Read Excel file
df = pd.read_excel(INPUT_FILE)
 
def clean_word(word):
    return re.sub(r"^\W+|\W+$", "", word)
 
output = []
 
for _, row in df.iterrows():
    sentence = str(row["sentence"])
    critical_word = str(row["critical_word"])
 
    words = sentence.split()
 
    # Find the critical word
    critical_index = None
    for i, word in enumerate(words):
        if clean_word(word).lower() == critical_word.lower():
            critical_index = i
            break
 
    if critical_index is None:
        raise ValueError(
            f"Critical word '{critical_word}' not found in sentence:\n{sentence}"
        )
 
    word_entries = []
 
    for i, word in enumerate(words):
        if i == critical_index:
            region = "critical"
        elif i == critical_index + 1:
            region = "spillover_1"
        elif i == critical_index + 2:
            region = "spillover_2"
        else:
            region = "0"
 
        word_entries.append({
            "form": word,
            "region": region,
            "lbr_before": False,
            "lbr_after": False,
            "word_sequence": i + 1
        })
 
    output.append({
        "words": word_entries,
        "type": str(row["type"]),
        "trial_id": str(row["trial_id"]),
        "item": int(row["item"]),
        "condition_voice": str(row["condition_voice"]),
        "condition_pronoun": str(row["condition_pronoun"]),
        "question_attribtute": str(row["question_attribute"]),
        "correct_answer": str(row["correct_answer"])
    })
 
# Write JSON output
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
 
print(f"\nDone! JSON written to: {OUTPUT_FILE}")