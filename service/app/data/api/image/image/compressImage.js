(function () {
  return function (argData, argParams, external) {
    const Jimp = require("jimp");

    const originalImage = argParams && argParams.originalImage;
    if (!originalImage || !originalImage.url) {
      external.response.end(
        JSON.stringify({
          success: false,
          message: "图片参数无效",
        })
      );
      return {
        async: true,
        response: {
          code: 400,
        },
      };
    }
    
    const imageUrl = String(originalImage.url || "");
    const dataUrlMatch = /^data:([^;]+);base64,(.+)$/.exec(imageUrl);
    if (!dataUrlMatch) {
      external.response.end(
        JSON.stringify({
          success: false,
          message: "图片数据无效",
        })
      );
      return {
        async: true,
        response: {
          code: 400,
        },
      };
    }
    
    const sourceMimeType = dataUrlMatch[1];
    const base64Content = dataUrlMatch[2];
    const sourceBuffer = Buffer.from(base64Content, "base64");
    const jimpOptions = normalizeJimpOptions(argParams && argParams.jimpOptions);

    // 使用Jimp的异步API
    Jimp.read(sourceBuffer, (err, image) => {
      if (err) {
        console.error('读取图片失败:', err);
        external.response.end(
          JSON.stringify({
            success: false,
            message: "压缩失败",
          })
        );
        return;
      }

      try {
        const sourceWidth = Math.max(1, image.bitmap.width || 1);
        const sourceHeight = Math.max(1, image.bitmap.height || 1);
        const scaleRatio = Math.max(0.1, Math.min(1, jimpOptions.scalePercent / 100));
        const width = Math.max(1, Math.floor(sourceWidth * scaleRatio));
        const height = Math.max(1, Math.floor(sourceHeight * scaleRatio));
        const mimeType = resolveOutputMime(sourceMimeType, jimpOptions.format, Jimp);
        const quality = Math.max(1, Math.min(100, jimpOptions.quality));
        const targetImage = image.clone().resize(width, height);
        if (mimeType === Jimp.MIME_JPEG) {
          targetImage.quality(quality);
        }

        // 获取buffer
        targetImage.getBuffer(mimeType, (err, buffer) => {
          if (err) {
            console.error('获取buffer失败:', err);
            external.response.end(
              JSON.stringify({
                success: false,
                message: "压缩失败",
              })
            );
            return;
          }

          external.response.end(
            JSON.stringify({
              success: true,
              data: {
                content: buffer.toString("base64"),
                mimeType: mimeType,
                size: buffer.length,
                width: width,
                height: height,
              },
            })
          );
        });
      } catch (error) {
        console.error('处理图片失败:', error);
        external.response.end(
          JSON.stringify({
            success: false,
            message: "压缩失败",
          })
        );
      }
    });

    return {
      async: true,
      response: {
        code: 200,
      },
    };
  };

  function resolveOutputMime(sourceMimeType, format, Jimp) {
    if (format === "jpeg") {
      return Jimp.MIME_JPEG;
    }
    if (format === "png") {
      return Jimp.MIME_PNG;
    }
    if (sourceMimeType === "image/png") {
      return Jimp.MIME_PNG;
    }
    return Jimp.MIME_JPEG;
  }

  function normalizeJimpOptions(raw) {
    return {
      quality: Math.max(1, Math.min(100, Number(raw && raw.quality) || 80)),
      scalePercent: Math.max(10, Math.min(100, Number(raw && raw.scalePercent) || 100)),
      format: String((raw && raw.format) || "same"),
    };
  }
})();
