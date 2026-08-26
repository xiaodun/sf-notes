import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Input } from 'antd';
import NProject from '../NProject';
import SelfStyle from '../LProject.less';

interface BranchPanelProps {
  open: boolean;
  branch: string;
  branches: string[];
  switching: boolean;
  onSelect: (branch: string) => void;
}

const BranchPanel: React.FC<BranchPanelProps> = ({
  open,
  branch,
  branches,
  switching,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const displayBranches = useMemo(() => {
    if (branches.length) return branches;
    return branch && branch !== '…' ? [branch] : [];
  }, [branches, branch]);

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return displayBranches;
    return displayBranches.filter((b) => b.toLowerCase().includes(q));
  }, [search, displayBranches]);

  return (
    <div
      className={SelfStyle.branchDropdown}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Input
        allowClear
        size="small"
        placeholder="搜索分支"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
      />
      <div className={SelfStyle.branchList}>
        {!displayBranches.length ? (
          <div className={SelfStyle.branchEmpty}>加载中…</div>
        ) : filteredBranches.length ? (
          filteredBranches.map((b) => (
            <div
              key={b}
              className={`${SelfStyle.branchItem} ${
                b === branch ? SelfStyle.branchItemActive : ''
              }`}
              onClick={() => {
                if (b !== branch && !switching) onSelect(b);
              }}
            >
              {b}
            </div>
          ))
        ) : (
          <div className={SelfStyle.branchEmpty}>无匹配分支</div>
        )}
      </div>
    </div>
  );
};

export interface BranchPickerProps {
  project: NProject;
  branch: string;
  branches: string[];
  switching: boolean;
  pulling: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (branch: string) => void;
  title?: string;
}

const BranchPicker: React.FC<BranchPickerProps> = ({
  branch,
  branches,
  switching,
  pulling,
  open,
  onOpenChange,
  onSelect,
  title,
}) => {
  return (
    <Dropdown
      trigger={['click']}
      disabled={pulling || switching}
      visible={open}
      destroyPopupOnHide={false}
      getPopupContainer={() => document.body}
      onVisibleChange={onOpenChange}
      overlay={
        <BranchPanel
          open={open}
          branch={branch}
          branches={branches}
          switching={switching}
          onSelect={onSelect}
        />
      }
    >
      <Button
        size="small"
        className={SelfStyle.gitBranchBtn}
        loading={switching}
        title={title || branch}
      >
        <span className={SelfStyle.gitBranch}>{branch}</span>
      </Button>
    </Dropdown>
  );
};

function branchesEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default React.memo(BranchPicker, (prev, next) => {
  return (
    prev.open === next.open &&
    prev.branch === next.branch &&
    prev.switching === next.switching &&
    prev.pulling === next.pulling &&
    prev.title === next.title &&
    branchesEqual(prev.branches, next.branches)
  );
});
