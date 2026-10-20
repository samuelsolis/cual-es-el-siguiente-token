import sys, glob, os
from PIL import Image
d, out = sys.argv[1], sys.argv[2]
fs = sys.argv[3:]
ims = [Image.open(os.path.join(d, f + ".png")).resize((960, 540)) for f in fs]
rows = (len(ims) + 1) // 2
sheet = Image.new("RGB", (1920, 540 * rows), "black")
for i, im in enumerate(ims): sheet.paste(im, ((i % 2) * 960, (i // 2) * 540))
sheet.save(out)
