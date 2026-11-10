# Training environment. Everything runs on CPU: no GPU or CUDA needed.
FROM python:3.11-slim

# The CPU build of PyTorch is a fraction of the size of the CUDA one.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

WORKDIR /work
# The model is downloaded into this same folder (.cache/), not inside the image.
ENV HF_HOME=/work/.cache
