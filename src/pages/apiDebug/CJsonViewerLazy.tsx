import { Input, Select, Typography } from 'antd';
import { CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prettifyJsonLoose } from './jsonPrettify';
import styles from './LApiDebug.less';

const { Option } = Select;
const INDENT = 22;

interface ILazyNode {
  __apiDebugLazy: true;
  kind: 'array' | 'object';
  pathTokens?: Array<string | number>;
  totalItems?: number;
  items?: any[];
  totalKeys?: number;
  entries?: Record<string, any>;
  nextCursor?: number;
}

function isLazyNode(v: any): v is ILazyNode {
  return !!v && typeof v === 'object' && v.__apiDebugLazy === true && (v.kind === 'array' || v.kind === 'object');
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hlSnippet(snippet: string, q: string): string {
  if (!q) return escHtml(snippet);
  const lower = snippet.toLowerCase();
  const sl = q.toLowerCase();
  let result = '';
  let last = 0;
  let idx = lower.indexOf(sl, 0);
  while (idx !== -1) {
    result += escHtml(snippet.slice(last, idx));
    result += `<mark style="background:#e6a23c;color:#1a1a2e;border-radius:2px;padding:0 2px">${escHtml(snippet.slice(idx, idx + sl.length))}</mark>`;
    last = idx + sl.length;
    idx = lower.indexOf(sl, last);
  }
  result += escHtml(snippet.slice(last));
  return result;
}

function tryExtractObject(snippet: string, searchTerm: string): Record<string, any> | null {
  const sl = searchTerm.toLowerCase();
  let best: Record<string, any> | null = null;
  let bestKeyCount = 0;

  for (let i = 0; i < snippet.length; i++) {
    if (snippet[i] !== '{') continue;
    let depth = 0;
    let inStr = false;
    let esc = false;

    for (let j = i; j < snippet.length; j++) {
      const c = snippet[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === '{' || c === '[') depth++;
      else if (c === '}' || c === ']') {
        depth--;
        if (depth < 0) break;
        if (depth === 0) {
          const sub = snippet.slice(i, j + 1);
          if (sub.toLowerCase().includes(sl)) {
            try {
              const obj = JSON.parse(sub);
              if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                const kc = Object.keys(obj).length;
                if (kc > bestKeyCount) {
                  best = obj;
                  bestKeyCount = kc;
                }
              }
            } catch {}
          }
          break;
        }
      }
    }
  }
  return best;
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
  if (isLazyNode(data)) {
    if (data.kind === 'array') return buildHtml(data.items || [], depth, searchText, searchMode, counter, activeIndex);
    return buildHtml(data.entries || {}, depth, searchText, searchMode, counter, activeIndex);
  }
  const pad = '  '.repeat(depth);
  if (data === null) return `<span class="${styles.jNull}">null</span>`;
  if (typeof data === 'boolean') return `<span class="${styles.jBool}">${data}</span>`;
  if (typeof data === 'number')
    return `<span class="${styles.jNum}">${hlText(String(data), 'value', searchText, searchMode, counter, activeIndex)}</span>`;
  if (typeof data === 'string')
    return `<span class="${styles.jStr}">"${hlText(data, 'value', searchText, searchMode, counter, activeIndex)}"</span>`;
  if (Array.isArray(data)) {
    if (!data.length) return '[]';
    const parts = data.map(
      (v, i) =>
        `\n${pad}  ${buildHtml(v, depth + 1, searchText, searchMode, counter, activeIndex)}${i < data.length - 1 ? ',' : ''}`,
    );
    return `[${parts.join('')}\n${pad}]`;
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (!keys.length) return '{}';
    const parts = keys.map(
      (k, i) =>
        `\n${pad}  <span class="${styles.jKey}">"${hlText(k, 'key', searchText, searchMode, counter, activeIndex)}"</span>: ${buildHtml(
          data[k],
          depth + 1,
          searchText,
          searchMode,
          counter,
          activeIndex,
        )}${i < keys.length - 1 ? ',' : ''}`,
    );
    return `{${parts.join('')}\n${pad}}`;
  }
  return escHtml(String(data));
}

interface NodeProps {
  data: any;
  keyName?: string;
  depth: number;
  defaultDepth: number;
  isLast: boolean;
  onLoadLazyNode?: (lazyNode: ILazyNode) => Promise<void> | void;
}

const JsonNode: React.FC<NodeProps> = ({ data, keyName, depth, defaultDepth, isLast, onLoadLazyNode }) => {
  const lazy = isLazyNode(data) ? data : null;
  const isArr = lazy ? lazy.kind === 'array' : Array.isArray(data);
  const isObj = lazy ? true : data !== null && typeof data === 'object';
  const [open, setOpen] = useState(depth < defaultDepth);
  const [loadingMore, setLoadingMore] = useState(false);

  const arrItems = lazy && lazy.kind === 'array' ? (lazy.items || []) : (Array.isArray(data) ? data : []);
  const objEntries = lazy && lazy.kind === 'object' ? (lazy.entries || {}) : ((!Array.isArray(data) && isObj) ? (data as Record<string, any>) : {});
  const objKeys = Object.keys(objEntries);
  const arrTotal = lazy && lazy.kind === 'array' ? Number(lazy.totalItems || arrItems.length) : arrItems.length;
  const objTotal = lazy && lazy.kind === 'object' ? Number(lazy.totalKeys || objKeys.length) : objKeys.length;
  const totalCount = isArr ? arrTotal : objTotal;
  const visibleCount = isArr ? arrItems.length : objKeys.length;
  const hasMore = lazy ? visibleCount < totalCount : false;

  const padding = { paddingLeft: depth * INDENT };
  const childPad = { paddingLeft: (depth + 1) * INDENT };
  const keyPart = keyName !== undefined ? <><span className={styles.jKey}>"{keyName}"</span>: </> : null;
  const comma = !isLast ? <span className={styles.jPunct}>,</span> : null;

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

  const onLoadMore = async () => {
    if (!lazy || !onLoadLazyNode || loadingMore) return;
    setLoadingMore(true);
    try {
      await onLoadLazyNode(lazy);
    } catch (e) {
      // 保持当前内容，不打断查看
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className={styles.jLine} style={padding}>
        <span className={styles.jArrow} onClick={() => setOpen(!open)}>
          {open ? <CaretDownFilled /> : <CaretRightFilled />}
        </span>
        {keyPart}
        <span className={styles.jPunct}>{isArr ? '[' : '{'}</span>
        {!open && (
          <>
            <span className={styles.jPunct}> ... </span>
            <span className={styles.jPunct}>{isArr ? ']' : '}'}</span>
            <span className={styles.jSize}> {isArr ? `${totalCount} items` : `${totalCount} keys`}</span>
            {comma}
          </>
        )}
        {open && <span className={styles.jSize}> {isArr ? `${totalCount} items` : `${totalCount} keys`}</span>}
      </div>
      {open && (
        <>
          {isArr &&
            arrItems.map((v, idx) => (
              <JsonNode
                key={idx}
                data={v}
                depth={depth + 1}
                defaultDepth={defaultDepth}
                isLast={idx === arrItems.length - 1 && !hasMore}
                onLoadLazyNode={onLoadLazyNode}
              />
            ))}
          {!isArr &&
            objKeys.map((k, idx) => (
              <JsonNode
                key={k}
                keyName={k}
                data={objEntries[k]}
                depth={depth + 1}
                defaultDepth={defaultDepth}
                isLast={idx === objKeys.length - 1 && !hasMore}
                onLoadLazyNode={onLoadLazyNode}
              />
            ))}
          {hasMore && (
            <div className={styles.jLine} style={childPad}>
              <span className={styles.jArrowPlaceholder} />
              <span
                className={styles.jLoadMore}
                role="button"
                tabIndex={0}
                onClick={() => void onLoadMore()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void onLoadMore();
                  }
                }}
              >
                {loadingMore
                  ? '加载中...'
                  : `加载更多 · 已显示 ${visibleCount} / ${totalCount} ${isArr ? '项' : '字段'}`}
              </span>
            </div>
          )}
          <div className={styles.jLine} style={padding}>
            <span className={styles.jArrowPlaceholder} />
            <span className={styles.jPunct}>{isArr ? ']' : '}'}</span>
            {comma}
          </div>
        </>
      )}
    </>
  );
};

interface CJsonViewerLazyProps {
  data: any;
  rawBody?: string;
  apiId?: number;
  onLoadLazyNode?: (lazyNode: ILazyNode) => Promise<void> | void;
  onRemoteSearch?: (q: string) => void;
  onLoadMoreResults?: () => void;
  remoteSearchLoading?: boolean;
  remoteSearchError?: string | null;
  remoteSearchHitCount?: number;
  remoteSearchSnippets?: Array<{byteOffset: number; snippet: string}>;
  remoteFileExhausted?: boolean;
}

const SEARCH_SS_PREFIX = 'apiDebug_search_';

function readSearchState(apiId?: number) {
  if (apiId == null) return { text: '', mode: 'all' as const };
  try {
    const raw = sessionStorage.getItem(SEARCH_SS_PREFIX + apiId);
    if (!raw) return { text: '', mode: 'all' as const };
    const obj = JSON.parse(raw);
    return {
      text: typeof obj.text === 'string' ? obj.text : '',
      mode: (obj.mode === 'key' || obj.mode === 'value' || obj.mode === 'all') ? obj.mode : 'all' as const,
    };
  } catch { return { text: '', mode: 'all' as const }; }
}

const MAX_RAW_PRETTY_CHARS = 3 * 1000 * 1000;

const CJsonViewerLazy: React.FC<CJsonViewerLazyProps> = ({
  data,
  rawBody,
  apiId,
  onLoadLazyNode,
  onRemoteSearch,
  onLoadMoreResults,
  remoteSearchLoading,
  remoteSearchError,
  remoteSearchHitCount,
  remoteSearchSnippets,
  remoteFileExhausted,
}) => {
  const [searchText, setSearchText] = useState(() => readSearchState(apiId).text);
  const [searchMode, setSearchMode] = useState<'key' | 'value' | 'all'>(() => readSearchState(apiId).mode);
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountTriggeredRef = useRef(false);

  useEffect(() => {
    if (apiId == null) return;
    try {
      if (searchText.trim()) {
        sessionStorage.setItem(SEARCH_SS_PREFIX + apiId, JSON.stringify({ text: searchText, mode: searchMode }));
      } else {
        sessionStorage.removeItem(SEARCH_SS_PREFIX + apiId);
      }
    } catch {}
  }, [apiId, searchText, searchMode]);

  const isSearching = searchText.trim().length > 0;
  const isParsed = data !== null && data !== undefined;

  const rawPretty = useMemo(() => {
    if (rawBody == null || rawBody === '') return '';
    const src = rawBody.length > MAX_RAW_PRETTY_CHARS ? rawBody.slice(0, MAX_RAW_PRETTY_CHARS) : rawBody;
    return prettifyJsonLoose(src);
  }, [rawBody]);

  const { searchHtml, totalMatches } = useMemo(() => {
    if (!isSearching) return { searchHtml: '', totalMatches: 0 };
    if (isParsed) {
      const counter = { n: 0 };
      const h = buildHtml(data, 0, searchText.trim(), searchMode, counter, activeIndex);
      return { searchHtml: `<pre class="${styles.jPre}">${h}</pre>`, totalMatches: counter.n };
    }
    if (rawPretty !== '') {
      const counter = { n: 0 };
      const h = hlText(rawPretty, 'value', searchText.trim(), 'all', counter, activeIndex);
      return { searchHtml: `<pre class="${styles.jPre}">${h}</pre>`, totalMatches: counter.n };
    }
    return { searchHtml: '', totalMatches: 0 };
  }, [data, searchText, searchMode, activeIndex, isParsed, rawPretty, isSearching]);

  const { remoteRendered, remoteMatchCount } = useMemo(() => {
    if (!isSearching || totalMatches > 0 || !remoteSearchSnippets || !remoteSearchSnippets.length) {
      return { remoteRendered: [] as Array<{ html: string }>, remoteMatchCount: 0 };
    }
    const q = searchText.trim();
    const counter = { n: 0 };
    const parts: Array<{ html: string }> = [];
    for (const s of remoteSearchSnippets) {
      const obj = tryExtractObject(s.snippet, q);
      if (obj) {
        parts.push({ html: buildHtml(obj, 0, q, 'all', counter, activeIndex) });
      } else {
        parts.push({ html: hlText(prettifyJsonLoose(s.snippet), 'value', q, 'all', counter, activeIndex) });
      }
    }
    return { remoteRendered: parts, remoteMatchCount: counter.n };
  }, [isSearching, totalMatches, remoteSearchSnippets, searchText, activeIndex]);

  const effectiveTotal = totalMatches > 0 ? totalMatches : remoteMatchCount;

  useEffect(() => {
    if (mountTriggeredRef.current) return;
    mountTriggeredRef.current = true;
    if (isSearching && totalMatches === 0 && onRemoteSearch) {
      onRemoteSearch(searchText.trim());
    }
  }, []);

  useEffect(() => {
    setActiveIndex(1);
  }, [searchText, searchMode]);

  useEffect(() => {
    if (!isSearching || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-midx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex, searchHtml, remoteMatchCount, isSearching]);

  const goPrev = useCallback(() => {
    if (effectiveTotal <= 0) return;
    setActiveIndex((i) => (i <= 1 ? effectiveTotal : i - 1));
  }, [effectiveTotal]);

  const goNext = useCallback(() => {
    if (effectiveTotal > 0) {
      if (activeIndex < effectiveTotal) {
        setActiveIndex((i) => i + 1);
      } else if (remoteMatchCount > 0 && !remoteFileExhausted && onLoadMoreResults && !remoteSearchLoading) {
        onLoadMoreResults();
      } else if (totalMatches > 0 && remoteMatchCount === 0 && !remoteSearchLoading) {
        setActiveIndex(1);
        const q2 = searchText.trim();
        if (q2 && onRemoteSearch) onRemoteSearch(q2);
      } else {
        setActiveIndex(1);
      }
      return;
    }
    if (remoteSearchLoading) return;
    // 本地已无“下一个”命中时，才触发远程搜索。
    const q = searchText.trim();
    if (q && onRemoteSearch) {
      onRemoteSearch(q);
    }
  }, [activeIndex, effectiveTotal, totalMatches, remoteMatchCount, remoteFileExhausted, onRemoteSearch, onLoadMoreResults, remoteSearchLoading, searchText]);

  return (
    <div className={styles.jsonViewer}>
      <div className={styles.jsonSearchBar}>
        <Input
          allowClear
          size="small"
          placeholder="搜索   Enter 下一个   Shift+Enter 上一个（本地无下一个时自动远程）"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (e.shiftKey) {
                goPrev();
              } else {
                goNext();
              }
            }
          }}
          style={{ width: 320 }}
        />
        <Select
          size="small"
          value={isParsed ? searchMode : 'all'}
          onChange={setSearchMode}
          style={{ width: 88 }}
          disabled={!isParsed}
          title={!isParsed ? '未解析为 JSON 时仅支持「全文」在原文中搜索' : undefined}
        >
          <Option value="all">全部</Option>
          <Option value="key">Key</Option>
          <Option value="value">Value</Option>
        </Select>
        {isSearching && (
          <span className={styles.matchCount}>
            {effectiveTotal > 0 ? `${activeIndex} / ${effectiveTotal}` : '本地无结果'}
          </span>
        )}
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          {remoteSearchLoading && '远程搜索中... '}
          {remoteSearchHitCount != null && remoteSearchHitCount > 0
            && `远程命中 ${remoteSearchHitCount} 条`}
          {!remoteSearchLoading && remoteSearchHitCount != null && remoteSearchHitCount > 0
            && !remoteFileExhausted && ' (可继续扫描)'}
        </Typography.Text>
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {remoteSearchError || ''}
        </Typography.Text>
      </div>

      <div ref={containerRef} className={styles.jsonBody}>
        {isParsed ? (
          isSearching ? (
            remoteRendered.length > 0 ? (
              <div>
                {remoteRendered.map((r, i) => (
                  <div key={i} style={{ marginBottom: 16, borderBottom: '1px solid #333', paddingBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                      匹配 #{i + 1}
                    </div>
                    <pre
                      className={styles.jPre}
                      style={{ margin: 0 }}
                      dangerouslySetInnerHTML={{ __html: r.html }}
                    />
                  </div>
                ))}
                {remoteSearchLoading && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>扫描中...</div>
                )}
                {!remoteSearchLoading && !remoteFileExhausted && (
                  <div
                    style={{ fontSize: 12, color: '#1890ff', marginTop: 8, cursor: 'pointer' }}
                    onClick={() => onLoadMoreResults?.()}
                  >
                    按 Enter 加载更多 / 点击此处继续扫描
                  </div>
                )}
                {!remoteSearchLoading && remoteFileExhausted && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>全部扫描完毕</div>
                )}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: searchHtml }} />
            )
          ) : (
            <JsonNode data={data} depth={0} defaultDepth={4} isLast={true} onLoadLazyNode={onLoadLazyNode} />
          )
        ) : isSearching ? (
          <div dangerouslySetInnerHTML={{ __html: searchHtml }} />
        ) : (
          <>
            {rawBody && rawBody.length > MAX_RAW_PRETTY_CHARS && (
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                仅展示前 {MAX_RAW_PRETTY_CHARS.toLocaleString()} 字符的格式化预览（全文过长）。
              </Typography.Text>
            )}
            <pre className={styles.jPre}>{rawPretty || rawBody || ''}</pre>
          </>
        )}
      </div>
    </div>
  );
};

export default CJsonViewerLazy;
