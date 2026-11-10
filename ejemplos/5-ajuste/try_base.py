"""Before fine-tuning: the base model with the test sentences."""

import sys

from common import load_base, show

tokenizer, model = load_base()
show(tokenizer, model, "Modelo base (solo preentrenado), antes del ajuste:", sys.argv[1:])
