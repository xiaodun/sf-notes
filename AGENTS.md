# AGENTS.md

仓库级协作约定。`CLAUDE.md` 通过 `@AGENTS.md` 引用本文件。

## 输入框支持清空

新增 / 改动文本输入时默认加清空能力：Ant Design 用 `allowClear`，自定义输入提供等价交互。密码框等不适合的场景、或用户明确说不要时才不加。

## 从 master 更新本地分支

用户说「更新 / 拉最新 / 同步 master」时，不要直接在本地分支 `git pull`：

1. 有未提交改动先 `git stash`（只储藏跟踪文件，不要 `-u`）
2. `git checkout master` → `git pull`
3. `git checkout` 回原分支（一般是 `home`）→ `git merge master`
4. 有 stash 再 `git stash pop`

有冲突就停下说明，不擅自解决完当没事；不要用 rebase 替代 merge；不要 force push；合完不要自动推远程。

## 推送：只拣选可发布内容到 master

本仓**不走整分支合入**：功能分支上的本地数据不能进远程。用户说「推送」时直接执行 `.agents/skills/push-workflow/SKILL.md`，不要先出计划等确认。

- `service/app/data/` 的 `*.json` 分两类：**A 类仅本地快照**（notes / swagger / upload / project 等）不进 master、不推远程；**B 类可发布内容**（名篇 / 警句 / 段子）随主分支推远程。
- 流程：A 类单独提交（只留本地）→ B 类 + 代码按功能提交 → `git checkout master` 拣选 B 类 + 代码 → `git push origin master`（不推功能分支）→ 切回原分支。细节与例外以技能为准。
