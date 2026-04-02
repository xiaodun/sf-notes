const fs = require("fs");
const path = require("path");

(function () {
  return function () {
    const storePath = path.join("./data/api/noval/noval/marks", "chapter_marks.json");

    function loadJsonSafe(filePath, fallbackValue) {
      if (!fs.existsSync(filePath)) return fallbackValue;
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw || "{}");
      } catch (e) {
        return fallbackValue;
      }
    }

    function saveJson(filePath, data) {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    function getNovelMarks(store, novelPath) {
      const key = String(novelPath || "");
      if (!store[key] || typeof store[key] !== "object") {
        store[key] = {};
      }
      return store[key];
    }

    return {
      createFloder: function (createFloder, external) {
        external.loadChapterMarkStore = function () {
          return loadJsonSafe(storePath, {});
        };

        external.saveChapterMarkStore = function (store) {
          saveJson(storePath, store || {});
        };

        external.getChapterMarkByNovel = function (store, novelPath, chapter) {
          const novelMarks = getNovelMarks(store, novelPath);
          return novelMarks[String(chapter)];
        };

        external.setChapterMarkByNovel = function (store, novelPath, chapter, chapterMark) {
          const novelMarks = getNovelMarks(store, novelPath);
          novelMarks[String(chapter)] = chapterMark;
        };

        external.deleteChapterMarkByNovel = function (store, novelPath, chapter) {
          const novelMarks = getNovelMarks(store, novelPath);
          const key = String(chapter);
          const existed = Object.prototype.hasOwnProperty.call(novelMarks, key);
          delete novelMarks[key];
          return existed;
        };
      },
    };
  };
})();
