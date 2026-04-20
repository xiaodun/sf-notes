/**
 * 不依赖 JSON.parse 的宽松格式化：在字符串外对 {},[],:, 等换行缩进，
 * 用于超大/不完整 JSON 流的可读预览（截断处可能略不整齐）。
 */
export function prettifyJsonLoose(input: string): string {
  if (!input) return '';
  let out = '';
  let indent = 0;
  let inStr = false;
  let esc = false;

  const pushIndent = () => {
    out += '\n';
    for (let i = 0; i < indent; i++) out += '  ';
  };

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (inStr) {
      out += c;
      if (esc) {
        esc = false;
      } else if (c === '\\') {
        esc = true;
      } else if (c === '"') {
        inStr = false;
      }
      continue;
    }

    if (c === '"') {
      out += c;
      inStr = true;
      continue;
    }

    if (c === ' ' || c === '\n' || c === '\r' || c === '\t') {
      continue;
    }

    if (c === '{' || c === '[') {
      out += c;
      indent++;
      pushIndent();
      continue;
    }

    if (c === '}' || c === ']') {
      indent = Math.max(0, indent - 1);
      pushIndent();
      out += c;
      continue;
    }

    if (c === ',') {
      out += c;
      pushIndent();
      continue;
    }

    if (c === ':') {
      out += ': ';
      continue;
    }

    out += c;
  }

  return out.trim();
}
