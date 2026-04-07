const fs = require("fs");
const path = require("path");

(function () {
  function getAllChapterFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return [];
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

  function countTextLength(text) {
    return String(text || "").replace(/\s/g, "").length;
  }

  function splitParagraphs(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
  }

  function getCharArray(text) {
    return Array.from(String(text || ""));
  }

  function calcCharLcsLen(aText, bText) {
    const a = getCharArray(aText);
    const b = getCharArray(bText);
    const n = a.length;
    const m = b.length;
    if (!n || !m) return 0;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    return dp[0][0];
  }

  function lineSimilarity(oldText, newText) {
    const oldArr = getCharArray(oldText);
    const newArr = getCharArray(newText);
    const maxLen = Math.max(oldArr.length, newArr.length);
    if (maxLen === 0) return 1;
    const lcsLen = calcCharLcsLen(oldText, newText);
    return lcsLen / maxLen;
  }

  function alignDeleteAddBlock(dels, adds) {
    const MODIFY_SIM_THRESHOLD = 0.55;
    const n = dels.length;
    const m = adds.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    const path = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));

    for (let i = 1; i <= n; i++) {
      dp[i][0] = dp[i - 1][0] + 1;
      path[i][0] = "delete";
    }
    for (let j = 1; j <= m; j++) {
      dp[0][j] = dp[0][j - 1] + 1;
      path[0][j] = "add";
    }

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const sim = lineSimilarity(dels[i - 1].text, adds[j - 1].text);
        const modifyPenalty = sim >= MODIFY_SIM_THRESHOLD ? 1 - sim : Number.POSITIVE_INFINITY;
        const candDelete = dp[i - 1][j] + 1;
        const candAdd = dp[i][j - 1] + 1;
        const candModify = dp[i - 1][j - 1] + modifyPenalty;
        let best = candModify;
        let action = "modify";
        if (candDelete < best) {
          best = candDelete;
          action = "delete";
        }
        if (candAdd < best) {
          best = candAdd;
          action = "add";
        }
        dp[i][j] = best;
        path[i][j] = action;
      }
    }

    const ops = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
      const action = path[i][j];
      if (action === "modify") {
        ops.push({
          type: "modify",
          oldIndex: dels[i - 1].oldIndex,
          newIndex: adds[j - 1].newIndex,
          oldText: dels[i - 1].text,
          newText: adds[j - 1].text,
          similarity: lineSimilarity(dels[i - 1].text, adds[j - 1].text),
        });
        i--;
        j--;
      } else if (action === "delete") {
        ops.push(dels[i - 1]);
        i--;
      } else {
        ops.push(adds[j - 1]);
        j--;
      }
    }

    ops.reverse();
    return ops;
  }

  function buildLineDiff(oldLines, newLines) {
    const n = oldLines.length;
    const m = newLines.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        if (oldLines[i] === newLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const primitiveOps = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (oldLines[i] === newLines[j]) {
        primitiveOps.push({ type: "equal", oldIndex: i, newIndex: j, text: oldLines[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        primitiveOps.push({ type: "delete", oldIndex: i, text: oldLines[i] });
        i++;
      } else {
        primitiveOps.push({ type: "add", newIndex: j, text: newLines[j] });
        j++;
      }
    }
    while (i < n) {
      primitiveOps.push({ type: "delete", oldIndex: i, text: oldLines[i] });
      i++;
    }
    while (j < m) {
      primitiveOps.push({ type: "add", newIndex: j, text: newLines[j] });
      j++;
    }

    const resultOps = [];
    let p = 0;
    while (p < primitiveOps.length) {
      const op = primitiveOps[p];
      if (op.type !== "delete") {
        if (op.type !== "equal") resultOps.push(op);
        p++;
        continue;
      }

      const dels = [];
      while (p < primitiveOps.length && primitiveOps[p].type === "delete") {
        dels.push(primitiveOps[p]);
        p++;
      }
      const adds = [];
      while (p < primitiveOps.length && primitiveOps[p].type === "add") {
        adds.push(primitiveOps[p]);
        p++;
      }

      const alignedOps = alignDeleteAddBlock(dels, adds);
      resultOps.push(...alignedOps);
    }

    return resultOps;
  }

  return function (argData, argParams, external) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter, 10);

    if (!novelPath || !fs.existsSync(novelPath)) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "路径不存在" } },
      };
    }

    if (!chapter || chapter < 1) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "章节号无效" } },
      };
    }

    try {
      const files = getAllChapterFiles(novelPath);
      const targetFilePath = files[chapter - 1];
      if (!targetFilePath || !fs.existsSync(targetFilePath)) {
        return {
          isWrite: false,
          response: { code: 200, data: { success: false, msg: "章节文件不存在" } },
        };
      }

      const store = external.loadChapterMarkStore();
      const chapterMark = external.getChapterMarkByNovel(store, novelPath, chapter);
      if (!chapterMark || (!Array.isArray(chapterMark.paragraphs) && !Array.isArray(chapterMark.rawLines))) {
        return {
          isWrite: false,
          response: { code: 200, data: { success: true, data: { hasMark: false, changes: [], markedParagraphIndexes: [] } } },
        };
      }

      const currentContent = fs.readFileSync(targetFilePath, "utf-8");
      const currentParagraphs = splitParagraphs(currentContent);
      const markedParagraphs = Array.isArray(chapterMark.rawLines)
        ? chapterMark.rawLines.map((item) => (item && typeof item.text === "string" ? item.text : ""))
        : (Array.isArray(chapterMark.paragraphs) ? chapterMark.paragraphs : []);
      const paragraphMarks = chapterMark.paragraphMarks && typeof chapterMark.paragraphMarks === "object"
        ? chapterMark.paragraphMarks
        : null;
      const markedParagraphIndexes = [];
      if (paragraphMarks) {
        for (const key of Object.keys(paragraphMarks)) {
          const idx = parseInt(key, 10);
          if (!Number.isNaN(idx)) {
            markedParagraphIndexes.push(idx);
          }
        }
      } else {
        for (let idx = 0; idx < markedParagraphs.length; idx++) {
          if (markedParagraphs[idx] !== undefined) {
            markedParagraphIndexes.push(idx);
          }
        }
      }
      markedParagraphIndexes.sort((a, b) => a - b);
      if (markedParagraphIndexes.length === 0) {
        return {
          isWrite: false,
          response: { code: 200, data: { success: true, data: { hasMark: false, changes: [], markedParagraphIndexes: [] } } },
        };
      }
      const changes = [];
      const lineOps = buildLineDiff(markedParagraphs, currentParagraphs);
      const debugTrace = [];
      for (const op of lineOps) {
        if (op.type === "equal") {
          debugTrace.push(`= old:${op.oldIndex + 1} -> new:${op.newIndex + 1}`);
          continue;
        }
        if (op.type === "delete") {
          debugTrace.push(`- old:${op.oldIndex + 1}`);
        } else if (op.type === "add") {
          debugTrace.push(`+ new:${op.newIndex + 1}`);
        } else if (op.type === "modify") {
          debugTrace.push(`~ old:${op.oldIndex + 1} -> new:${op.newIndex + 1} sim:${(op.similarity || 0).toFixed(3)}`);
        }
        if (op.type === "equal") continue;
        if (op.type === "delete") {
          if (!markedParagraphIndexes.includes(op.oldIndex)) continue;
          const oldText = op.text || "";
          if (oldText.trim() === "") continue;
          const newText = "";
          changes.push({
            paragraphIndex: op.oldIndex,
            paragraphNo: op.oldIndex + 1,
            oldLineNo: op.oldIndex + 1,
            newLineNo: null,
            changeType: "delete",
            displayMode: "block",
            oldText,
            newText,
            oldLength: countTextLength(oldText),
            newLength: 0,
            delta: -countTextLength(oldText),
          });
          continue;
        }
        if (op.type === "add") {
          const newText = op.text || "";
          if (newText.trim() === "") continue;
          const lineIndex = op.newIndex;
          changes.push({
            paragraphIndex: lineIndex,
            paragraphNo: lineIndex + 1,
            oldLineNo: null,
            newLineNo: lineIndex + 1,
            changeType: "add",
            displayMode: "block",
            oldText: "",
            newText,
            oldLength: 0,
            newLength: countTextLength(newText),
            delta: countTextLength(newText),
          });
          continue;
        }
        if (op.type === "modify") {
          if (!markedParagraphIndexes.includes(op.oldIndex)) continue;
          const oldText = op.oldText || "";
          const newText = op.newText || "";
          const oldLen = countTextLength(oldText);
          const newLen = countTextLength(newText);
          const similarity = typeof op.similarity === "number" ? op.similarity : lineSimilarity(oldText, newText);
          changes.push({
            paragraphIndex: op.newIndex,
            paragraphNo: op.newIndex + 1,
            oldLineNo: op.oldIndex + 1,
            newLineNo: op.newIndex + 1,
            changeType: "modify",
            displayMode: similarity < 0.35 ? "block" : "inline",
            oldText,
            newText,
            oldLength: oldLen,
            newLength: newLen,
            delta: newLen - oldLen,
          });
        }
      }
      try {
        console.log("[chapter-diff]", `chapter=${chapter}`, debugTrace.join(" | "));
      } catch (e) {}

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: {
              hasMark: true,
              markedAt: chapterMark.markedAt,
              changes,
              markedParagraphIndexes,
              debugTrace,
            },
          },
        },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "对比失败: " + error.message } },
      };
    }
  };
})();
