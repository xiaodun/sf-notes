import { Input, Select } from 'antd';
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './LApiDebug.less';

const { Option } = Select;

// 默认展开深度。当节点总数过多时降级。
function decideDefaultDepth(data: any): number {
  let count = 0;
  function walk(d: any, depth: number) {
    if (count > 2000 || depth > 10) return;
    if (d && typeof d === 'object') {
      const keys = Array.isArray(d) ? d.map((_, i) => i) : Object.keys(d);
      for (const k of keys) {
        count++;
        walk((d as any)[k], depth + 1);
      }
    }
  }
  walk(data, 0);
  if (count <= 200) return 99;
  if (count <= 800) return 6;
  return 3;
}

// ─── 树节点（左侧箭头版） ────────────────────────────────────────────────────

interface NodeProps {
  data: any;
  keyName?: string;
  depth: number;
  defaultDepth: number;
  isLast: boolean;
}

const INDENT = 22;

const JsonNode: React.FC<NodeProps> = ({ data, keyName, depth, defaultDepth, isLast }) => {
  const isObj = data !== null && typeof data === 'object';
  const isArr = Array.isArray(data);
  const [open, setOpen] = useState(depth < defaultDepth);

  const padding = { paddingLeft: depth * INDENT };
  const keyPart = keyName !== undefined ? <><span className={styles.jKey}>"{keyName}"</span>: </> : null;
  const comma = !isLast ? <span className={styles.jPunct}>,</span> : null;

  // 基础值
  if (!isObj) {
    let valNode: React.ReactNode;
    if (data === null) valNode = <span className={styles.jNull}>null</span>;
    else if (typeof data === 'boolean') valNode = <span className={styles.jBool}>{String(data)}</span>;
    else if (typeof data === 'number') valNode = <span className={styles.jNum}>{data}</span>;
    else valNode = <span className={styles.jStr}>"{String(data)}"</span>;
    return (
      <div className={styles.jLine} style={padding}>
        <span className={styles.jArrowPlaceholder} />
        {keyPart}
        {valNode}
        {comma}
      </div>
    );
  }

  // 对象/数组
  const keys = isArr ? (data as any[]).map((_, i) => i) : Object.keys(data);
  const empty = keys.length === 0;
  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';
  const sizeHint = (
    <span className={styles.jSize}>
      {' '}
      {isArr ? `${keys.length}` : `${keys.length}`} {isArr ? 'items' : 'keys'}
    </span>
  );

  if (empty) {
    return (
      <div className={styles.jLine} style={padding}>
        <span className={styles.jArrowPlaceholder} />
        {keyPart}
        <span className={styles.jPunct}>{openBracket}{closeBracket}</span>
        {comma}
      </div>
    );
  }

  return (
    <>
      <div className={styles.jLine} style={padding}>
        <span className={styles.jArrow} onClick={() => setOpen(!open)}>
          {open ? <CaretDownFilled /> : <CaretRightFilled />}
        </span>
        {keyPart}
        <span className={styles.jPunct}>{openBracket}</span>
        {!open && (
          <>
            <span className={styles.jPunct}> ... </span>
            <span className={styles.jPunct}>{closeBracket}</span>
            {sizeHint}
            {comma}
          </>
        )}
        {open && sizeHint}
      </div>
      {open && (
        <>
          {keys.map((k, i) => (
            <JsonNode
              key={String(k)}
              data={(data as any)[k as any]}
              keyName={isArr ? undefined : String(k)}
              depth={depth + 1}
              defaultDepth={defaultDepth}
              isLast={i === keys.length - 1}
            />
          ))}
          <div className={styles.jLine} style={padding}>
            <span className={styles.jArrowPlaceholder} />
            <span className={styles.jPunct}>{closeBracket}</span>
            {comma}
          </div>
        </>
      )}
    </>
  );
};

// ─── 搜索模式：扁平 HTML 高亮 ────────────────────────────────────────────────

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hlText(
  text: string,
  role: 'key' | 'value',
  searchText: string,
  searchMode: 'key' | 'value' | 'all',
  counter: { n: number },
  activeIndex: number,
): string {
  const escaped = escHtml(text);
  if (!searchText) return escaped;
  if (searchMode !== 'all' && searchMode !== role) return escaped;
  const lower = text.toLowerCase();
  const sl = searchText.toLowerCase();
  if (!lower.includes(sl)) return escaped;
  let result = '';
  let last = 0;
  let idx = lower.indexOf(sl, 0);
  while (idx !== -1) {
    result += escHtml(text.slice(last, idx));
    counter.n++;
    const isActive = counter.n === activeIndex;
    result += `<mark data-midx="${counter.n}" class="${styles.hlMark}${isActive ? ' ' + styles.hlActive : ''}">${escHtml(text.slice(idx, idx + sl.length))}</mark>`;
    last = idx + sl.length;
    idx = lower.indexOf(sl, last);
  }
  result += escHtml(text.slice(last));
  return result;
}

function buildHtml(
  data: any,
  depth: number,
  searchText: string,
  searchMode: 'key' | 'value' | 'all',
  counter: { n: number },
  activeIndex: number,
): string {
  const pad = '  '.repeat(depth);
  if (data === null) return `<span class="${styles.jNull}">null</span>`;
  if (typeof data === 'boolean') return `<span class="${styles.jBool}">${data}</span>`;
  if (typeof data === 'number')
    return `<span class="${styles.jNum}">${hlText(String(data), 'value', searchText, searchMode, counter, activeIndex)}</span>`;
  if (typeof data === 'string')
    return `<span class="${styles.jStr}">"${hlText(data, 'value', searchText, searchMode, counter, activeIndex)}"</span>`;
  if (Array.isArray(data)) {
    if (!data.length) return '[]';
    const items = data.map((item, i) => `\n${pad}  ${buildHtml(item, depth + 1, searchText, searchMode, counter, activeIndex)}${i < data.length - 1 ? ',' : ''}`).join('');
    return `[${items}\n${pad}]`;
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (!keys.length) return '{}';
    const entries = keys
      .map((key, i) => `\n${pad}  <span class="${styles.jKey}">"${hlText(key, 'key', searchText, searchMode, counter, activeIndex)}"</span>: ${buildHtml(data[key], depth + 1, searchText, searchMode, counter, activeIndex)}${i < keys.length - 1 ? ',' : ''}`)
      .join('');
    return `{${entries}\n${pad}}`;
  }
  return escHtml(String(data));
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface CJsonViewerProps {
  data: any;
  rawBody?: string;
}

const CJsonViewer: React.FC<CJsonViewerProps> = ({ data, rawBody }) => {
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState<'key' | 'value' | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSearching = searchText.trim().length > 0;
  const isParsed = data !== null && data !== undefined;

  const defaultDepth = useMemo(() => (isParsed ? decideDefaultDepth(data) : 99), [data, isParsed]);

  const { html, totalMatches } = useMemo(() => {
    if (!isSearching || !isParsed) return { html: '', totalMatches: 0 };
    const counter = { n: 0 };
    const h = buildHtml(data, 0, searchText.trim(), searchMode, counter, activeIndex);
    return { html: `<pre class="${styles.jPre}">${h}</pre>`, totalMatches: counter.n };
  }, [data, searchText, searchMode, activeIndex, isParsed]);

  useEffect(() => { setActiveIndex(1); }, [searchText, searchMode]);

  useEffect(() => {
    if (!isSearching || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-midx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex, html]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 1 ? totalMatches : i - 1));
  }, [totalMatches]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i >= totalMatches ? 1 : i + 1));
  }, [totalMatches]);

  return (
    <div className={styles.jsonViewer}>
      <div className={styles.jsonSearchBar}>
        <Input
          allowClear
          size="small"
          placeholder="搜索   Enter 下一个   Shift+Enter 上一个"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (e.shiftKey) goPrev();
              else goNext();
            }
          }}
          style={{ width: 320 }}
        />
        <Select size="small" value={searchMode} onChange={setSearchMode} style={{ width: 88 }}>
          <Option value="all">全部</Option>
          <Option value="key">Key</Option>
          <Option value="value">Value</Option>
        </Select>
        {isSearching && (
          <span className={styles.matchCount}>
            {totalMatches > 0 ? `${activeIndex} / ${totalMatches}` : '无结果'}
          </span>
        )}
      </div>

      <div ref={containerRef} className={styles.jsonBody}>
        {!isParsed ? (
          <pre className={styles.jPre}>{rawBody ?? ''}</pre>
        ) : isSearching ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <JsonNode data={data} depth={0} defaultDepth={defaultDepth} isLast={true} />
        )}
      </div>
    </div>
  );
};

export default CJsonViewer;
