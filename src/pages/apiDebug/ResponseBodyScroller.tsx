import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Typography } from 'antd';
import request from '@/utils/request';
import CJsonViewer from './CJsonViewerLazy';

interface ResponseBodyScrollerProps {
  apiId: number;
  bodyCharLength?: number;
  /** 结构外层快照（由服务端裁剪大数组/深层对象） */
  bodyEnvelope?: any;
  /** envelope 缺失时的 JSON 兜底 */
  bodyPublicHead?: string;
  className?: string;
}

/** 公共头内尝试 JSON.parse 生成树的上限 */
const MAX_PUBLIC_PARSE_CHARS = 600_000;

/**
 * 外置大正文：展示体验与小数据一致（树形 + 搜索），只是大节点继续展开时按需请求。
 */
const ResponseBodyScroller: React.FC<ResponseBodyScrollerProps> = ({
  apiId,
  bodyCharLength,
  bodyEnvelope,
  bodyPublicHead = '',
  className,
}) => {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [searchHitCount, setSearchHitCount] = useState(0);
  const [searchSnippets, setSearchSnippets] = useState<Array<{byteOffset: number; snippet: string}>>([]);
  const [fileExhausted, setFileExhausted] = useState(false);
  const [treeVersion, setTreeVersion] = useState(0);
  const searchRunIdRef = useRef(0);
  const lastStartedQRef = useRef('');
  const cursorByteRef = useRef(0);
  const seenOffsetsRef = useRef(new Set<number>());
  const nonOffsetHitsRef = useRef(0);
  const allSnippetsRef = useRef<Array<{byteOffset: number; snippet: string}>>([]);

  const viewerData = useMemo(() => {
    if (bodyEnvelope != null) return bodyEnvelope;
    if (!bodyPublicHead || bodyPublicHead.length > MAX_PUBLIC_PARSE_CHARS) return undefined;
    try {
      return JSON.parse(bodyPublicHead);
    } catch {
      return undefined;
    }
  }, [bodyEnvelope, bodyPublicHead]);

  const loadLazyNode = useCallback(
    async (lazyNode: any) => {
      const kind = lazyNode?.kind;
      if (kind !== 'array' && kind !== 'object') return;
      const pathTokens = Array.isArray(lazyNode.pathTokens) ? lazyNode.pathTokens : [];
      const cursor = Number(lazyNode.nextCursor || 0);
      const rsp: any = await request({
        url: '/apiDebug/getResponseNodeSlice',
        method: 'post',
        data: { apiId, pathTokens, cursor, limit: 120 },
      });
      if (!rsp?.success) {
        throw new Error(rsp?.message || '按需加载失败');
      }

      if (kind === 'array') {
        const more = Array.isArray(rsp.items) ? rsp.items : [];
        const oldItems = Array.isArray(lazyNode.items) ? lazyNode.items : [];
        lazyNode.items = oldItems.concat(more);
        lazyNode.loadedItems = lazyNode.items.length;
      } else {
        const oldEntries =
          lazyNode.entries && typeof lazyNode.entries === 'object' ? lazyNode.entries : {};
        const moreEntries =
          rsp.entries && typeof rsp.entries === 'object' ? rsp.entries : {};
        lazyNode.entries = { ...oldEntries, ...moreEntries };
        lazyNode.loadedKeys = Object.keys(lazyNode.entries).length;
      }
      lazyNode.nextCursor = rsp.nextCursor || 0;
      setTreeVersion((v) => v + 1);
    },
    [apiId],
  );

  const fetchSegment = useCallback(async (q: string, isNew: boolean) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const runId = isNew ? ++searchRunIdRef.current : searchRunIdRef.current;
    if (isNew) {
      lastStartedQRef.current = trimmed;
      cursorByteRef.current = 0;
      seenOffsetsRef.current = new Set();
      nonOffsetHitsRef.current = 0;
      allSnippetsRef.current = [];
      setSearchHitCount(0);
      setSearchSnippets([]);
      setFileExhausted(false);
      setSearchErr(null);
    }
    setSearchLoading(true);
    const prevSnippetCount = allSnippetsRef.current.length;
    try {
      let exhausted = false;
      while (!exhausted) {
        const prevCursor = cursorByteRef.current;
        const rsp: any = await request({
          url: '/apiDebug/getResponseBodySearch',
          method: 'get',
          params: {
            apiId,
            q: trimmed,
            cursorByte: cursorByteRef.current,
            maxScanBytes: 2 * 1024 * 1024,
            maxMatches: 200,
            overlapBytes: 256,
          },
        });
        if (!rsp.success) throw new Error(rsp.message || '搜索失败');
        if (runId !== searchRunIdRef.current) return;
        const list = Array.isArray(rsp.matches) ? rsp.matches : [];
        list.forEach((m: any) => {
          const off = Number(m?.byteOffset);
          if (Number.isFinite(off) && off >= 0) {
            if (!seenOffsetsRef.current.has(off)) {
              allSnippetsRef.current.push({ byteOffset: off, snippet: String(m?.snippet || '') });
            }
            seenOffsetsRef.current.add(off);
          } else {
            nonOffsetHitsRef.current += 1;
          }
        });
        cursorByteRef.current = Number(rsp.nextScanByte || cursorByteRef.current);
        if (cursorByteRef.current <= prevCursor && !rsp.fileExhausted) {
          throw new Error('远程搜索游标未推进，已中止以避免死循环');
        }
        exhausted = !!rsp.fileExhausted;
        if (runId === searchRunIdRef.current) {
          setSearchHitCount(seenOffsetsRef.current.size + nonOffsetHitsRef.current);
          setSearchSnippets(allSnippetsRef.current.slice());
          setFileExhausted(exhausted);
        }
        if (allSnippetsRef.current.length > prevSnippetCount) break;
      }
    } catch (e: any) {
      if (runId === searchRunIdRef.current) {
        setSearchErr(e?.message || '搜索失败');
        setSearchHitCount(seenOffsetsRef.current.size + nonOffsetHitsRef.current);
        setSearchSnippets(allSnippetsRef.current.slice());
      }
    } finally {
      if (runId === searchRunIdRef.current) {
        setSearchLoading(false);
      }
    }
  }, [apiId]);

  const startSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSearchErr('请输入搜索内容');
      return;
    }
    void fetchSegment(q, true);
  }, [fetchSegment]);

  const loadMore = useCallback(() => {
    if (fileExhausted || searchLoading) return;
    const q = lastStartedQRef.current;
    if (!q) return;
    void fetchSegment(q, false);
  }, [fetchSegment, fileExhausted, searchLoading]);

  return (
    <div className={className}>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        {bodyCharLength != null && bodyCharLength > 0 && (
          <>约 {bodyCharLength.toLocaleString()} 字符（正文主体在服务端 .body.txt）</>
        )}
      </Typography.Text>

      {viewerData != null ? (
        <div
          style={{
            height: 520,
            minHeight: 320,
            marginBottom: 16,
            display: 'flex',
          }}
        >
          <CJsonViewer
            key={treeVersion}
            apiId={apiId}
            data={viewerData}
            onLoadLazyNode={loadLazyNode}
            onRemoteSearch={(q) => {
              if (lastStartedQRef.current === q) return;
              startSearch(q);
            }}
            onLoadMoreResults={loadMore}
            remoteSearchLoading={searchLoading}
            remoteSearchError={searchErr}
            remoteSearchHitCount={searchHitCount}
            remoteSearchSnippets={searchSnippets}
            remoteFileExhausted={fileExhausted}
          />
        </div>
      ) : (
        <Typography.Paragraph type="warning" style={{ fontSize: 12, marginBottom: 16 }}>
          当前缓存尚未生成可展示结构，请重新发送一次请求。
        </Typography.Paragraph>
      )}

    </div>
  );
};

export default ResponseBodyScroller;
