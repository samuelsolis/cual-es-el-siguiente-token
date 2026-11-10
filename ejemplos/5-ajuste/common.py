"""What the three scripts share: the base model, the text format and how to generate."""

import json
import os
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers.utils import logging

# Only our own messages on screen: no progress bars or library warnings.
logging.set_verbosity_error()
logging.disable_progress_bar()

# A small base model: only pre-trained, never fine-tuned to answer.
BASE_MODEL = os.environ.get("BASE_MODEL", "HuggingFaceTB/SmolLM2-135M")
HERE = Path(__file__).parent
ADAPTER = HERE / "adapter"


def load_base():
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, dtype=torch.float32)
    return tokenizer, model


def prompt(text):
    """The text the model gets: only the sentence and a line break. It continues from there.
    There is no hint about JSON: the format has to come from the fine-tuning."""
    return f"{text}\n"


def generate(tokenizer, model, text, max_tokens=40):
    """Always the most likely token (no sampling), until the end mark or the limit."""
    ids = tokenizer(prompt(text), return_tensors="pt")
    with torch.no_grad():
        out = model.generate(
            **ids,
            max_new_tokens=max_tokens,
            do_sample=False,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )
    new = out[0][ids["input_ids"].shape[1]:]
    return tokenizer.decode(new, skip_special_tokens=True)


def load_examples():
    """The training examples: one JSON file per example in datos/."""
    files = sorted((HERE / "datos").glob("*.json"))
    return [json.loads(f.read_text(encoding="utf-8")) for f in files]


def load_test():
    """The test sentences: never seen during training."""
    return json.loads((HERE / "prueba.json").read_text(encoding="utf-8"))


def check(answer, expected):
    """Is it valid JSON? Does it have the right fields?"""
    try:
        data = json.loads(answer.strip())
    except ValueError:
        return "no es JSON"
    if data == expected:
        return "correcto"
    return "JSON, pero con errores"


def show(tokenizer, model, title, own_texts):
    """With your own sentences, it only shows what comes out; without them, it uses the test sentences and checks them."""
    print(title)
    print()
    if own_texts:
        for text in own_texts:
            print(f"  Frase: {text}")
            print(f"  Sale:  {generate(tokenizer, model, text).strip()}")
            print()
        return
    results = []
    for item in load_test():
        answer = generate(tokenizer, model, item["texto"])
        verdict = check(answer, item["esperado"])
        results.append(verdict)
        print(f"  Frase: {item['texto']}")
        print(f"  Sale:  {answer.strip()}")
        print(f"  → {verdict}")
        print()
    good = results.count("correcto")
    print(f"Correctos: {good} de {len(results)}.")
