(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const originalImage = argParams.originalImage;
    const targetImage = (argData || []).find(
      (item) => String(item.id) === String(originalImage.id)
    );
    if (!targetImage) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "图片不存在",
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
    const fileBuffer = Buffer.from(base64Content, "base64");
    const filePath = path.join("./data/api/image/image/", targetImage.flag);
    fs.writeFileSync(filePath, fileBuffer);

    const timestamp = +new Date();
    const updatedImage = {
      ...targetImage,
      type: mimeType,
      mimeType,
      url: `/api/image/image/getImageContent?id=${targetImage.id}`,
      isProcessed: false,
      storage: {
        ...(targetImage.storage || {}),
        timestamp,
      },
    };

    const newData = argData.map((item) =>
      String(item.id) === String(originalImage.id) ? updatedImage : item
    );
    
    return {
      isWrite: true,
      data: newData,
      response: {
        code: 200,
        data: {
          success: true,
          list: newData,
        },
      },
    };
  };
})();
