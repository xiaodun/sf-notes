(function () {
  const fs = require("fs");
  const path = require("path");
  const Jimp = require("jimp");

  main().catch(() => {
    process.exit(1);
  });

  async function main() {
    const args = process.argv.slice(2);
    const inputPath = args[0];
    const outputPath = args[1];
    const metaPath = args[2];
    const targetBytes = Math.max(1, Math.round(Number(args[3]) || 0));
    const sourceMimeType = String(args[4] || "");

    const sourceBuffer = fs.readFileSync(inputPath);
    const sourceSize = sourceBuffer.length;
    if (!targetBytes || targetBytes >= sourceSize) {
      fs.writeFileSync(outputPath, sourceBuffer);
      writeMeta(metaPath, { mimeType: sourceMimeType, size: sourceSize, width: 0, height: 0 });
      return;
    }

    let image;
    try {
      image = await Jimp.read(sourceBuffer);
    } catch (error) {
      fs.writeFileSync(outputPath, sourceBuffer);
      writeMeta(metaPath, { mimeType: sourceMimeType, size: sourceSize, width: 0, height: 0 });
      return;
    }

    const sourceWidth = Math.max(1, image.bitmap.width || 1);
    const sourceHeight = Math.max(1, image.bitmap.height || 1);
    const outputMimeType = resolveOutputMimeType(sourceMimeType);
    const scaleFactors = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4];

    let best = { buffer: sourceBuffer, size: sourceSize, width: sourceWidth, height: sourceHeight };
    let bestDistance = Math.abs(sourceSize - targetBytes);

    for (const scaleFactor of scaleFactors) {
      const width = Math.max(1, Math.floor(sourceWidth * scaleFactor));
      const height = Math.max(1, Math.floor(sourceHeight * scaleFactor));
      if (outputMimeType === Jimp.MIME_JPEG) {
        let low = 10;
        let high = 95;
        for (let i = 0; i < 16; i++) {
          const quality = Math.round((low + high) / 2);
          const candidate = await renderCompressed(image, width, height, outputMimeType, quality);
          const distance = Math.abs(candidate.size - targetBytes);
          if (
            distance < bestDistance ||
            (distance === bestDistance && candidate.size <= targetBytes && best.size > targetBytes)
          ) {
            best = candidate;
            bestDistance = distance;
          }
          if (candidate.size > targetBytes) {
            high = quality - 1;
          } else {
            low = quality + 1;
          }
        }
      } else {
        const candidate = await renderCompressed(image, width, height, outputMimeType, 100);
        const distance = Math.abs(candidate.size - targetBytes);
        if (
          distance < bestDistance ||
          (distance === bestDistance && candidate.size <= targetBytes && best.size > targetBytes)
        ) {
          best = candidate;
          bestDistance = distance;
        }
      }
    }

    fs.writeFileSync(outputPath, best.buffer);
    writeMeta(metaPath, { mimeType: outputMimeType, size: best.size, width: best.width, height: best.height });
  }

  async function renderCompressed(sourceImage, width, height, mimeType, quality) {
    const cloned = sourceImage.clone().resize(width, height, Jimp.RESIZE_BILINEAR);
    if (mimeType === Jimp.MIME_JPEG) {
      cloned.quality(Math.max(1, Math.min(100, quality)));
    }
    const buffer = await cloned.getBufferAsync(mimeType);
    return { buffer, size: buffer.length, width, height };
  }

  function resolveOutputMimeType(sourceMimeType) {
    if (sourceMimeType === "image/png") {
      return "image/jpeg";
    }
    if (sourceMimeType === "image/webp") {
      return "image/jpeg";
    }
    if (sourceMimeType === "image/jpeg") {
      return "image/jpeg";
    }
    return "image/jpeg";
  }

  function writeMeta(metaPath, meta) {
    try {
      fs.writeFileSync(metaPath, JSON.stringify(meta));
    } catch (error) {}
  }
})();
