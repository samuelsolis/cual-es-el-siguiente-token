"""After fine-tuning: the same base model with the adapter on top, and the same test sentences."""

import sys

from peft import PeftModel

from common import ADAPTER, load_base, show

if not ADAPTER.exists():
    raise SystemExit("No encuentro el adaptador. Entrena antes: python train.py")

tokenizer, model = load_base()
model = PeftModel.from_pretrained(model, ADAPTER)
show(tokenizer, model, "El mismo modelo con el ajuste:", sys.argv[1:])
