const fs = require("fs");
const path = require("path");
const WATCH_STATE_KEY = "__sfNovelWatchState";

function getWatchState() {
  if (!global[WATCH_STATE_KEY]) {
    global[WATCH_STATE_KEY] = { watchers: new Map() };
  }
  return global[WATCH_STATE_KEY];
}

(function () {
  return function () {
    const storePath = path.join("./data/api/novel/novel/marks", "chapter_marks.json");

    function getAllChapterFiles(dir) {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (e) {
        return results;
      }
      entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(getAllChapterFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith(".txt")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    function rebuildChapterMap(item) {
      const map = new Map();
      const files = getAllChapterFiles(item.novelPath);
      for (let i = 0; i < files.length; i++) {
        map.set(path.resolve(files[i]), i + 1);
      }
      item.chapterFileMap = map;
    }

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
          // 覆盖策略：清空该小说下其他章，只保留当前章
          for (const k of Object.keys(novelMarks)) {
            delete novelMarks[k];
          }
          novelMarks[String(chapter)] = chapterMark;
        };

        external.deleteChapterMarkByNovel = function (store, novelPath, chapter) {
          const novelMarks = getNovelMarks(store, novelPath);
          const existed = Object.keys(novelMarks).length > 0;
          // 清空该小说下所有标记（不关心当前 chapter 是几）
          for (const k of Object.keys(novelMarks)) {
            delete novelMarks[k];
          }
          return existed;
        };

        external.ensureNovelWatcher = function (novelPath, chapter) {
          const key = path.resolve(String(novelPath || ""));
          if (!key || !fs.existsSync(key)) return;
          const watchState = getWatchState();
          let item = watchState.watchers.get(key);
          if (!item) {
            item = {
              novelPath: key,
              currentChapter: Number(chapter) || 1,
              chapterFileMap: new Map(),
              watcher: null,
            };
            rebuildChapterMap(item);
            const onChange = function (eventType, filename) {
              if (!filename) return;
              const changedPath = path.resolve(item.novelPath, String(filename));
              if (!changedPath.endsWith(".txt")) return;
              let changedChapter = item.chapterFileMap.get(changedPath);
              if (!changedChapter) {
                rebuildChapterMap(item);
                changedChapter = item.chapterFileMap.get(changedPath);
              }
              if (!changedChapter) return;
              if (changedChapter !== item.currentChapter) return;
              external.broadcast({
                key: "NOVEL",
                type: "CHAPTER_FILE_CHANGED",
                novelPath: item.novelPath,
                chapter: changedChapter,
                filePath: changedPath,
                eventType: eventType || "change",
                at: Date.now(),
              });
            };
            try {
              item.watcher = fs.watch(item.novelPath, { recursive: true }, onChange);
            } catch (e) {
              item.watcher = fs.watch(item.novelPath, onChange);
            }
            watchState.watchers.set(key, item);
          } else {
            item.currentChapter = Number(chapter) || item.currentChapter || 1;
            rebuildChapterMap(item);
          }
          item.currentChapter = Number(chapter) || item.currentChapter || 1;
        };

        external.closeNovelWatcher = function (novelPath) {
          const key = path.resolve(String(novelPath || ""));
          if (!key) return false;
          const watchState = getWatchState();
          const item = watchState.watchers.get(key);
          if (!item) return false;
          try {
            item.watcher && item.watcher.close && item.watcher.close();
          } catch (e) { }
          watchState.watchers.delete(key);
          return true;
        };
      },
    };
  };
})();
