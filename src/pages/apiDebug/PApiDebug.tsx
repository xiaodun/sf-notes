import {
  Button,
  Input,
  Select,
  message,
  Popconfirm,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  CheckOutlined,
  AppstoreAddOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import request from '@/utils/request';
import CJsonViewer from './CJsonViewer';
import SelfStyle from './LApiDebug.less';

const { TextArea } = Input;
const { Option } = Select;
const LS_KEY = 'apiDebug_selectedApiId';

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface IHeaderItem { id: number; key: string; value: string }
interface IApp { id: number; name: string; headers: IHeaderItem[] }
interface IApiItem {
  id: number; appId: number | null; name: string; method: 'GET' | 'POST';
  url: string; lastQuery: string; lastBody: string;
  lastResponse: IResponse | null;
}
interface IResponse {
  success: boolean; status?: number; elapsed?: number;
  body?: string; parsedBody?: any; error?: string;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

const PApiDebug: React.FC = () => {
  // 数据
  const [apps, setApps] = useState<IApp[]>([]);
  const [apis, setApis] = useState<IApiItem[]>([]);

  // 侧边栏展开
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());

  // 面板：app 配置 or api 调试
  const [panelMode, setPanelMode] = useState<'app' | 'api' | null>(null);

  // App 配置面板
  const [editingApp, setEditingApp] = useState<IApp | null>(null);

  // API 调试面板
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null);
  const [apiName, setApiName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<IResponse | null>(null);
  const [sending, setSending] = useState(false);

  // 弹窗
  const [addAppVisible, setAddAppVisible] = useState(false);
  const [addAppName, setAddAppName] = useState('');
  const [addApiVisible, setAddApiVisible] = useState(false);
  const [addApiForm, setAddApiForm] = useState<{ name: string; method: 'GET' | 'POST'; url: string; appId: number | null }>({ name: '', method: 'GET', url: '', appId: null });

  const addAppNameRef = useRef<any>(null);
  const addApiNameRef = useRef<any>(null);
  const nameInputRef = useRef<any>(null);

  // ── 加载 ──────────────────────────────────────────────────────────────────

  const fetchList = () =>
    request({ url: '/apiDebug/getList', method: 'get' }).then((rsp: any) => {
      const newApps: IApp[] = rsp.apps || [];
      const newApis: IApiItem[] = rsp.apis || [];
      setApps(newApps);
      setApis(newApis);
      return { newApps, newApis };
    });

  useEffect(() => {
    fetchList().then(({ newApis }) => {
      // 恢复上次选中的 API
      const savedId = Number(localStorage.getItem(LS_KEY));
      if (savedId) {
        const target = newApis.find((a) => a.id === savedId);
        if (target) {
          if (target.appId) setExpandedApps((s) => new Set([...s, target.appId!]));
          openApiPanel(target);
        }
      }
    });
  }, []);

  // ── 工具：保存字段 ────────────────────────────────────────────────────────

  const saveApiField = (patch: Partial<IApiItem>) => {
    if (!selectedApiId) return;
    request({ url: '/apiDebug/save', method: 'post', data: { item: { id: selectedApiId, ...patch } } })
      .then(() => fetchList());
  };

  // ── 打开面板 ──────────────────────────────────────────────────────────────

  const openApiPanel = (item: IApiItem) => {
    setSelectedApiId(item.id);
    setApiName(item.name);
    setMethod(item.method);
    setUrl(item.url);
    setQuery(item.lastQuery || '');
    setBody(item.lastBody || '');
    setResponse(item.lastResponse || null);
    setEditingName(false);
    setPanelMode('api');
    localStorage.setItem(LS_KEY, String(item.id));
  };

  const openAppPanel = (app: IApp) => {
    setEditingApp(JSON.parse(JSON.stringify(app))); // 深拷贝，不直接修改原始
    setPanelMode('app');
    setSelectedApiId(null);
  };

  // ── App 操作 ──────────────────────────────────────────────────────────────

  const handleAddApp = async () => {
    if (!addAppName.trim()) { message.warning('请输入分组名称'); return; }
    const rsp: any = await request({ url: '/apiDebug/saveApp', method: 'post', data: { app: { name: addAppName.trim() } } });
    if (rsp.success) {
      message.success('分组创建成功');
      setAddAppVisible(false);
      setAddAppName('');
      const { newApps } = await fetchList();
      const newApp = newApps.find((a) => a.name === addAppName.trim());
      if (newApp) {
        setExpandedApps((s) => new Set([...s, newApp.id]));
        openAppPanel(newApp);
      }
    }
  };

  const handleDelApp = async (id: number) => {
    await request({ url: '/apiDebug/delApp', method: 'post', data: { id } });
    if (panelMode === 'app' && editingApp?.id === id) setPanelMode(null);
    fetchList();
  };

  const handleSaveApp = async () => {
    if (!editingApp) return;
    const validHeaders = editingApp.headers.filter((h) => h.key.trim());
    const rsp: any = await request({ url: '/apiDebug/saveApp', method: 'post', data: { app: { ...editingApp, headers: validHeaders } } });
    if (rsp.success) {
      message.success('保存成功');
      fetchList();
    }
  };

  const addHeader = () => {
    if (!editingApp) return;
    setEditingApp({ ...editingApp, headers: [...editingApp.headers, { id: Date.now(), key: '', value: '' }] });
  };

  const updateHeader = (id: number, field: 'key' | 'value', val: string) => {
    if (!editingApp) return;
    setEditingApp({
      ...editingApp,
      headers: editingApp.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
    });
  };

  const delHeader = (id: number) => {
    if (!editingApp) return;
    setEditingApp({ ...editingApp, headers: editingApp.headers.filter((h) => h.id !== id) });
  };

  // ── API 操作 ──────────────────────────────────────────────────────────────

  const handleAddApi = async () => {
    if (!addApiForm.name.trim() || !addApiForm.url.trim()) { message.warning('名称和 URL 不能为空'); return; }
    const rsp: any = await request({
      url: '/apiDebug/save', method: 'post',
      data: { item: { name: addApiForm.name.trim(), method: addApiForm.method, url: addApiForm.url.trim(), appId: addApiForm.appId, lastQuery: '', lastBody: '' } },
    });
    if (rsp.success) {
      message.success('创建成功');
      const targetAppId = addApiForm.appId;
      setAddApiVisible(false);
      setAddApiForm({ name: '', method: 'GET', url: '', appId: null });
      // 自动展开所属分组
      if (targetAppId) {
        setExpandedApps((s) => new Set([...s, targetAppId]));
      }
      const { newApis } = await fetchList();
      const newApi = newApis.find((a) => a.name === addApiForm.name.trim() && a.url === addApiForm.url.trim());
      if (newApi) openApiPanel(newApi);
    } else {
      message.error(rsp.message || '创建失败');
    }
  };

  const handleDelApi = async (id: number) => {
    await request({ url: '/apiDebug/del', method: 'post', data: { id } });
    if (selectedApiId === id) { setPanelMode(null); setSelectedApiId(null); }
    fetchList();
  };

  const handleMethodChange = (v: 'GET' | 'POST') => {
    setMethod(v);
    saveApiField({ method: v });
  };

  const handleNameConfirm = () => {
    if (!apiName.trim()) { message.warning('名称不能为空'); return; }
    setEditingName(false);
    saveApiField({ name: apiName.trim() });
  };

  // ── 发送 ──────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!selectedApiId) return;
    if (!url.trim()) { message.warning('请填写请求地址'); return; }
    if (method === 'POST' && body.trim()) {
      try { JSON.parse(body); } catch { message.error('Body 不是合法的 JSON'); return; }
    }
    setSending(true);
    setResponse(null);
    const rsp: any = await request({ url: '/apiDebug/send', method: 'post', data: { apiId: selectedApiId, method, url, query, body } });
    setSending(false);
    if (rsp.success && rsp.result) {
      const result: IResponse = rsp.result;
      setResponse(result);
      // 同步更新内存里这条 API 的缓存（避免重新 fetchList）
      setApis((prev) => prev.map((a) => a.id === selectedApiId ? {
        ...a,
        lastQuery: method === 'GET' ? query : a.lastQuery,
        lastBody: method === 'POST' ? body : a.lastBody,
        lastResponse: result,
      } : a));
    } else {
      message.error('发送失败');
    }
  };

  const selectedApi = apis.find((a) => a.id === selectedApiId) || null;

  // ── 侧边栏 ────────────────────────────────────────────────────────────────

  const toggleApp = (id: number) => {
    setExpandedApps((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const ungrouped = apis.filter((a) => !a.appId);

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  const renderApiItem = (api: IApiItem) => (
    <div
      key={api.id}
      className={`${SelfStyle.apiItem} ${selectedApiId === api.id ? SelfStyle.active : ''}`}
      onClick={() => openApiPanel(api)}
    >
      <span className={`${SelfStyle.methodTag} ${api.method === 'GET' ? SelfStyle.get : SelfStyle.post}`}>
        {api.method}
      </span>
      <span className={SelfStyle.apiName}>{api.name}</span>
      <Popconfirm title="确认删除此 API？" onConfirm={(e) => { e?.stopPropagation(); handleDelApi(api.id); }} onCancel={(e) => e?.stopPropagation()}>
        <DeleteOutlined className={SelfStyle.delBtn} onClick={(e) => e.stopPropagation()} />
      </Popconfirm>
    </div>
  );

  return (
    <div className={SelfStyle.main}>
      {/* ── 左侧 ── */}
      <div className={SelfStyle.sidebar}>
        <div className={SelfStyle.sidebarHeader}>
          <Button type="primary" icon={<AppstoreAddOutlined />} block size="small" onClick={() => setAddAppVisible(true)}>
            新建分组
          </Button>
          <Button icon={<ApiOutlined />} block size="small" style={{ marginTop: 6 }} onClick={() => { setAddApiForm({ name: '', method: 'GET', url: '', appId: null }); setAddApiVisible(true); }}>
            新建 API
          </Button>
        </div>

        <div className={SelfStyle.apiList}>
          {/* 应用分组 */}
          {apps.map((app) => {
            const appApis = apis.filter((a) => a.appId === app.id);
            const expanded = expandedApps.has(app.id);
            return (
              <div key={app.id}>
                <div className={`${SelfStyle.appHeader} ${panelMode === 'app' && editingApp?.id === app.id ? SelfStyle.active : ''}`}>
                  <span className={SelfStyle.appToggle} onClick={() => toggleApp(app.id)}>
                    {expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                  </span>
                  <span className={SelfStyle.appName} onClick={() => openAppPanel(app)}>{app.name}</span>
                  <PlusOutlined className={SelfStyle.appAction} onClick={() => { setAddApiForm({ name: '', method: 'GET', url: '', appId: app.id }); setAddApiVisible(true); }} />
                  <Popconfirm title="删除分组及其所有 API？" onConfirm={() => handleDelApp(app.id)}>
                    <DeleteOutlined className={SelfStyle.appAction} />
                  </Popconfirm>
                </div>
                {expanded && <div className={SelfStyle.appApis}>{appApis.map(renderApiItem)}</div>}
              </div>
            );
          })}

          {/* 未分组 */}
          {ungrouped.length > 0 && (
            <div>
              <div className={SelfStyle.ungroupedLabel}>未分组</div>
              {ungrouped.map(renderApiItem)}
            </div>
          )}

          {apps.length === 0 && ungrouped.length === 0 && (
            <div className={SelfStyle.empty}>暂无 API</div>
          )}
        </div>
      </div>

      {/* ── 右侧 ── */}
      <div className={SelfStyle.content}>
        {/* ─ App 配置面板 ─ */}
        {panelMode === 'app' && editingApp && (
          <>
            <div className={SelfStyle.panelTitle}>分组配置 · {editingApp.name}</div>
            <div className={SelfStyle.label}>公共 Headers（每个接口请求都会携带）</div>
            <div className={SelfStyle.headersTable}>
              <div className={SelfStyle.headersRow} style={{ fontWeight: 600, color: '#888', fontSize: 12 }}>
                <span style={{ flex: 1 }}>Key</span>
                <span style={{ flex: 2 }}>Value</span>
                <span style={{ width: 24 }} />
              </div>
              {editingApp.headers.map((h) => (
                <div key={h.id} className={SelfStyle.headersRow}>
                  <Input size="small" style={{ flex: 1 }} value={h.key} placeholder="Header-Key" onChange={(e) => updateHeader(h.id, 'key', e.target.value)} />
                  <Input size="small" style={{ flex: 2 }} value={h.value} placeholder="value" onChange={(e) => updateHeader(h.id, 'value', e.target.value)} />
                  <DeleteOutlined style={{ color: '#ccc', cursor: 'pointer', width: 24, textAlign: 'center' }} onClick={() => delHeader(h.id)} />
                </div>
              ))}
              <Button size="small" icon={<PlusOutlined />} type="dashed" onClick={addHeader} style={{ width: '100%', marginTop: 6 }}>
                添加 Header
              </Button>
            </div>
            <div className={SelfStyle.actionRow}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveApp}>保存</Button>
            </div>
          </>
        )}

        {/* ─ API 调试面板 ─ */}
        {panelMode === 'api' && selectedApi && (
          <>
            {/* 名称行 */}
            <div className={SelfStyle.nameRow}>
              {editingName ? (
                <Input
                  ref={nameInputRef}
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  onBlur={handleNameConfirm}
                  onPressEnter={handleNameConfirm}
                  suffix={<CheckOutlined onClick={handleNameConfirm} style={{ cursor: 'pointer', color: '#1890ff' }} />}
                  style={{ fontSize: 15, fontWeight: 500 }}
                />
              ) : (
                <div className={SelfStyle.nameDisplay} onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0); }}>
                  <span>{apiName}</span>
                  <EditOutlined className={SelfStyle.nameEditIcon} />
                </div>
              )}
            </div>

            {/* URL 行 */}
            <div className={SelfStyle.urlRow}>
              <Select value={method} style={{ width: 90 }} onChange={handleMethodChange}>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
              </Select>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} onBlur={() => saveApiField({ url: url.trim() })} placeholder="请求地址" style={{ flex: 1 }} />
            </div>

            {/* 参数区 */}
            <div className={SelfStyle.paramsArea}>
              {method === 'GET' ? (
                <>
                  <div className={SelfStyle.label}>Query 参数（拼接在 URL 后）</div>
                  <Input.TextArea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="id=1&token=abc" autoSize={{ minRows: 3, maxRows: 6 }} />
                </>
              ) : (
                <>
                  <div className={SelfStyle.label}>Body（JSON）</div>
                  <TextArea value={body} onChange={(e) => setBody(e.target.value)} placeholder={'{\n  "key": "value"\n}'} autoSize={{ minRows: 5, maxRows: 10 }} style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: 12 }} />
                </>
              )}
            </div>

            {/* 操作 */}
            <div className={SelfStyle.actionRow}>
              <Button icon={<SendOutlined />} type="primary" loading={sending} onClick={handleSend}>发送</Button>
            </div>

            {/* 响应区 */}
            <div className={SelfStyle.responseArea}>
              {response && (
                <div className={SelfStyle.responseMeta}>
                  <span>
                    状态：
                    <span className={response.success && (response.status || 0) < 400 ? SelfStyle.statusOk : SelfStyle.statusErr}>
                      {response.status ?? (response.error ? '错误' : '-')}
                    </span>
                  </span>
                  {response.elapsed != null && <span>耗时：{response.elapsed}ms</span>}
                </div>
              )}
              {response ? (
                response.error ? (
                  <div className={SelfStyle.responseBox}>{`错误：${response.error}`}</div>
                ) : (
                  <CJsonViewer data={response.parsedBody} rawBody={response.body} />
                )
              ) : (
                <div className={SelfStyle.responseBox}>{'// 响应结果将显示在这里'}</div>
              )}
            </div>
          </>
        )}

        {/* ─ 空状态 ─ */}
        {!panelMode && (
          <div className={SelfStyle.empty} style={{ paddingTop: 80 }}>
            请在左侧选择分组或 API
          </div>
        )}
      </div>

      {/* ── 新建应用弹窗 ── */}
      <Modal title="新建分组" open={addAppVisible} onOk={handleAddApp} onCancel={() => { setAddAppVisible(false); setAddAppName(''); }} okText="创建" cancelText="取消"
        afterOpenChange={(o) => { if (o) addAppNameRef.current?.focus(); }}>
        <Input ref={addAppNameRef} placeholder="分组名称（如：Lotus 云函数）" value={addAppName} onChange={(e) => setAddAppName(e.target.value)} onPressEnter={handleAddApp} style={{ marginTop: 8 }} />
      </Modal>

      {/* ── 新建 API 弹窗 ── */}
      <Modal title="新建 API" open={addApiVisible} onOk={handleAddApi} onCancel={() => setAddApiVisible(false)} okText="创建" cancelText="取消"
        afterOpenChange={(o) => { if (o) addApiNameRef.current?.focus(); }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          <Input ref={addApiNameRef} placeholder="名称（如：获取用户信息）" value={addApiForm.name} onChange={(e) => setAddApiForm({ ...addApiForm, name: e.target.value })} onPressEnter={handleAddApi} />
          <Select value={addApiForm.method} onChange={(v) => setAddApiForm({ ...addApiForm, method: v })} style={{ width: '100%' }}>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
          </Select>
          <Input placeholder="URL（如：http://localhost:9100/api/user）" value={addApiForm.url} onChange={(e) => setAddApiForm({ ...addApiForm, url: e.target.value })} onPressEnter={handleAddApi} />
          <Select value={addApiForm.appId ?? 'none'} onChange={(v) => setAddApiForm({ ...addApiForm, appId: v === 'none' ? null : (v as number) })} style={{ width: '100%' }}>
            <Option value="none">不归属分组</Option>
            {apps.map((app) => <Option key={app.id} value={app.id}>{app.name}</Option>)}
          </Select>
        </div>
      </Modal>

    </div>
  );
};

export default PApiDebug;
