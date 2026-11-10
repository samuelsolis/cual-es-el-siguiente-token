"""Fine-tune the base model with LoRA so that, given a sentence, it answers only with a JSON.

The same loop as always (generate, compare, correct), with three differences:
  - it starts from the pre-trained model, not from random numbers;
  - the error is only measured on the answer, not on the question;
  - the model itself is frozen: only a small add-on (LoRA) is trained.
"""

import json
import os
import random
import time

import torch
from peft import LoraConfig, get_peft_model
from torch.utils.data import DataLoader

from common import ADAPTER, load_base, load_examples, prompt

ROUNDS = int(os.environ.get("ROUNDS", 15))
BATCH = 4
RATE = float(os.environ.get("RATE", 1e-3))

random.seed(31)
torch.manual_seed(31)
tokenizer, model = load_base()


def build(example):
    """Returns (tokens, labels). The labels hide the question with -100:
    the error is only measured on the answer."""
    answer = json.dumps(example["respuesta"], ensure_ascii=False) + tokenizer.eos_token
    question_ids = tokenizer(prompt(example["texto"]), add_special_tokens=False)["input_ids"]
    answer_ids = tokenizer(answer, add_special_tokens=False)["input_ids"]
    return question_ids + answer_ids, [-100] * len(question_ids) + answer_ids


def batch(items):
    length = max(len(ids) for ids, _ in items)
    pad = tokenizer.pad_token_id
    return {
        "input_ids": torch.tensor([ids + [pad] * (length - len(ids)) for ids, _ in items]),
        "attention_mask": torch.tensor([[1] * len(ids) + [0] * (length - len(ids)) for ids, _ in items]),
        "labels": torch.tensor([lab + [-100] * (length - len(lab)) for _, lab in items]),
    }


examples = load_examples()
data = [build(e) for e in examples]
loader = DataLoader(data, batch_size=BATCH, shuffle=True, collate_fn=batch)

# LoRA: the whole model is frozen and small trainable matrices are inserted
# into the query and value projections of every attention layer.
config = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05, target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
model = get_peft_model(model, config)

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"Ejemplos de entrenamiento: {len(examples)}")
print(f"Números del modelo:    {total:,}".replace(",", "."))
print(f"Números que se entrenan: {trainable:,}  ({100 * trainable / total:.2f} %)".replace(",", "."))
print()

optimizer = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=RATE)
model.train()
start = time.time()
for r in range(ROUNDS):
    loss_sum = 0.0
    for b in loader:
        out = model(**b)
        out.loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        loss_sum += out.loss.item()
    print(f"vuelta {r + 1:2d}/{ROUNDS}   error medio {loss_sum / len(loader):.4f}")

seconds = time.time() - start
model.save_pretrained(ADAPTER)
size = sum(f.stat().st_size for f in ADAPTER.rglob("*") if f.is_file())
print()
print(f"Entrenamiento: {seconds:.0f} s en CPU.")
print(f"Ajuste guardado en adapter/: {size / 1024**2:.2f} MB.")
