---
name: push-workflow
description: 本仓库「推送」发布流程：按数据/内容/代码拆提交，只拣选可发布内容与功能到 master 并推远程，功能分支本地数据不进 master、不推远程。用户说「推送」、发布、上主分支，或上一需求已完成又提新需求且工作区有待发布改动时使用。
---

# 「推送」工作流

用户说「推送」（或同等发布意图）时：**直接执行，不要先出计划等确认**。做完后用几句话说明提交了什么、推了什么。

前提：在功能分支开发（如 `home` / `company`）。目标主分支为 `master`。开始前记下当前分支名，全部完成后切回去。

提交信息一律用中文。远程 `master` 有未拉取提交则先 `git pull origin master`；冲突谨慎，自己能处理的处理完要说明，不能处理的停下来问。不修改 git config、不强推、不跳过 hook。

## 数据文件两类

`service/app/data/` 下的 `*.json` 必须分开处理：

### A. 仅本地快照（不进 master、不推远程）

如 notes / swagger / upload / project，以及名篇/警句/段子以外的个人或环境数据。与 `master` 差异大，拣选必冲突。

### B. 可发布内容数据（要进 master、随主分支推远程）

| 模块 | 路径 |
|------|------|
| 名篇 | `service/app/data/api/classics/**/*.json`（含 `classics.json` 与 `files/*.json`） |
| 警句 | `service/app/data/api/maxim/**/*.json`（如 `maxim.json`） |
| 段子 | `service/app/data/api/jokes/**/*.json`（如 `jokes.json`） |

## 执行顺序

1. **本地数据提交**：仅 `git add` A 类改动的 `*.json`，单独提交一次。**只留在功能分支本地：不拣选到 `master`，也不推送到远程。**
2. **可发布内容数据提交**：若有 B 类 json 改动，单独提交一次。
3. **功能代码提交**：其余改动（主要 `src/**`、规则/技能等）再按功能提交。
4. `git checkout master`，`git cherry-pick`：**可发布内容数据提交 + 功能代码提交**（绝不拣选本地数据提交）。
5. `git push origin master` 只推主分支；**不要推送功能分支**（否则会把本地数据一起推到远程）。
6. `git checkout` 回到开始前记下的功能分支。不要停留在 `master`。

## 注意

- A 类永远不进 `master`、不推远程，仅作为功能分支上的本地快照
- B 类与代码一样进 `master` 并推远程
- 上一需求已完成、用户又提新需求，且工作区仍有待发布改动时：先按本流程推送，完成后再做新需求
