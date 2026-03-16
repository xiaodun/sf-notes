(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");
    const child_process = require("child_process");
    const originalImage = argParams && argParams.originalImage;
    const compressionLevel = Number(argParams && argParams.compressionLevel) || 0;
    const targetBytes = Math.max(0, Math.round(compressionLevel * 1024));
    if (!originalImage || !originalImage.url) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "图片参数无效",
          },
        },
      };
    }
    const imageUrl = String(originalImage.url || "");
    const dataUrlMatch = /^data:([^;]+);base64,(.+)$/.exec(imageUrl);
    if (!dataUrlMatch) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "图片数据无效",
          },
        },
      };
    }

    const mimeType = dataUrlMatch[1];
    const base64Content = dataUrlMatch[2];
    const sourceBuffer = Buffer.from(base64Content, "base64");
    if (!targetBytes) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "压缩大小无效",
          },
        },
      };
    }
    let outputBuffer = sourceBuffer;
    let outputMimeType = mimeType;
    let outputWidth = 0;
    let outputHeight = 0;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sf-notes-compress-"));
    const inputPath = path.join(tempDir, "input.bin");
    const outputPath = path.join(tempDir, "output.bin");
    const metaPath = path.join(tempDir, "meta.json");
    const workerPath = path.join(process.cwd(), "data/api/image/image/compressImageWorker.js");
    try {
      fs.writeFileSync(inputPath, sourceBuffer);
      child_process.execFileSync(
        process.execPath,
        [workerPath, inputPath, outputPath, metaPath, String(targetBytes), mimeType],
        { stdio: "pipe" }
      );
      outputBuffer = fs.readFileSync(outputPath);
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8") || "{}");
      outputMimeType = meta.mimeType || mimeType;
      outputWidth = Number(meta.width) || 0;
      outputHeight = Number(meta.height) || 0;
    } catch (error) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "压缩失败",
          },
        },
      };
    } finally {
      try {
        if (fs.rmSync) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } else if (fs.rmdirSync) {
          fs.rmdirSync(tempDir, { recursive: true });
        }
      } catch (error) {}
    }

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            content: outputBuffer.toString("base64"),
            mimeType: outputMimeType,
            size: outputBuffer.length,
            width: outputWidth,
            height: outputHeight,
          },
        },
      },
    };
  };
})();
