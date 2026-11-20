# 蚍蜉战队 · RoboMaster 2027 招新报名页

一个可以直接用 **HBuilderX 打开运行的纯静态招新网页**。页面围绕 RoboMaster 机甲大师的赛场气质设计，包含战队简介、队名释义、五大组别详细介绍、招募流程和完整的面试报名表。

> **蚍蜉撼大树，可敬不自量。**
>
> 蚍蜉战队隶属于河北外国语学院，是学校面向 RoboMaster 机甲大师赛组建的学生科技创新团队，成立于 2026 年。2027 赛季招新开启，期待与你并肩作战。

## 页面预览

| 桌面端 | 移动端 |
| --- | --- |
| ![桌面端首屏](screenshots/preview-desktop.png) | ![移动端首屏](screenshots/preview-mobile.png) |

![队伍简介与队名释义](screenshots/preview-story.png)

![五大组别详细介绍](screenshots/preview-departments.png)

![报名表](screenshots/preview-form.png)

## 功能清单

- **战队简介与队名释义**：介绍河北外国语学院蚍蜉战队的建队背景，并完整呈现“蚍蜉撼大树”的队名精神。
- **五大面试部门**：电控组、视觉组、机械组、算法组、运营宣传组，每个组别包含工作介绍、三项核心职责与能力关键词，可选择并同步到报名表。
- **Getform / Forminit 一键接入**：提交即写入云端表单后台，支持照片上传、邮件通知与 Google Sheets 同步；未配置时自动退回演示模式。
- **必填报名信息**：姓名、专业、电话、邮箱、面试部门、自我介绍、优势。
- **个人照片上传**：支持点击或拖拽上传，支持 JPG / PNG / WebP，限制 5MB；上传后自动预览、压缩并显示文件信息。
- **优势能力标签**：根据所选部门动态展示能力标签，可多选，作为优势的补充。
- **表单校验**：手机号、邮箱格式校验；空项、字数、照片、隐私同意均有提示，并自动定位到第一个错误项。
- **草稿自动保存**：未提交的内容自动保存在浏览器本地，刷新后可恢复（照片不会写入草稿）。
- **提交反馈**：演示模式下在本地生成报名编号并展示成功档案；可下载 JSON 备份。
- **响应式布局**：桌面、平板、手机三档布局，含移动端折叠菜单。
- **机甲大师视觉元素**：机甲蚁概念机体、HUD 锁定框、战术扫描线、机械网格、队徽、滚动字幕与分区块编号。
- **队训视觉层**：首屏“蚍蜉撼大树 / 可敬不自量”主标语、朱红印章、成长年轮光晕、双态口号字幕带与页脚队训。

## 在 HBuilderX 中运行

1. 打开 HBuilderX，选择 **文件 → 打开目录**，选中本项目文件夹 `pifu-robomaster-recruit`。
2. 在左侧项目管理器中双击 `index.html`。
3. 点击菜单 **运行 → 运行到浏览器**（选择 Chrome / Edge / HBuilderX 内置浏览器即可）。
4. 也可以在系统文件管理器中直接双击 `index.html`，不需要安装依赖或编译。

> 本项目是普通 HTML5 静态项目，不是 uni-app 项目，因此不需要执行 `npm install`，也不需要 `manifest.json`。

## 部署到 GitHub Pages

仓库根目录已提供 `.github/workflows/pages.yml`，会把 `pifu-robomaster-recruit` 文件夹作为静态站点发布，无需构建命令。

1. 将仓库推送到 GitHub 的 `main` 或 `master` 分支。
2. 打开仓库 **Settings → Pages**，把 **Build and deployment → Source** 设为 **GitHub Actions**。
3. 推送后等待 Actions 里的 `Deploy recruitment site to GitHub Pages` 运行完成。
4. 访问 `https://<用户名>.github.io/<仓库名>/` 即可。

页面中的 CSS、JS、队徽和插画全部使用相对路径，因此部署在仓库子路径下也能正常加载。站点文件夹内已放置 `.nojekyll`，若改用分支发布（Deploy from a branch）也不会被 Jekyll 处理。

如果只把 `pifu-robomaster-recruit` 文件夹本身作为仓库根目录，请把 `.github/workflows/pages.yml` 一并放到该文件夹的 `.github/workflows/` 下，并把工作流里的 `path` 改为 `./`。

> GitHub Pages 上线后，记得在 Forminit 后台 **Settings → Authorized domains** 中添加 `<用户名>.github.io`，避免真实报名提交被判定为垃圾信息。

## 目录结构

```text
pifu-robomaster-recruit/
├─ index.html                  # 页面结构与全部文案
├─ css/
│  └─ style.css                # 视觉样式、动画与响应式布局
├─ js/
│  └─ app.js                   # 部门联动、表单校验、照片上传、提交逻辑
├─ assets/
│  ├─ team-logo.png            # 蚍蜉战队队徽
│  ├─ mech-ant.svg             # 机甲蚁概念机体插画
│  └─ favicon.png              # 浏览器图标
├─ .nojekyll                   # GitHub Pages 禁用 Jekyll 处理
├─ screenshots/                # 预览截图与自动化测试结果
└─ README.md
```

## 报名数据如何真正提交

页面已接入 **Forminit**（forminit.com，原 Getform）云表单后台：提交后数据实时写入你的 Forminit 表单（当前表单 ID：`u6p36letnuf`），成功弹窗会显示后台返回的提交编号。无需服务器、无需密钥，字段在首次提交时自动建立。

> 注：页面同时保留前端演示模式——只有在 `FORM_CONFIG.formId` 留空时才启用（提交仅保存在浏览器本地）。

## 已接入配置

`js/app.js` 顶部：

```js
var FORM_CONFIG = {
  formId: "u6p36letnuf" // 在 app.forminit.com 创建的表单 ID；留空则进入演示模式
};
```

- 提交使用官方 SDK（`index.html` 中已加载 `https://forminit.com/sdk/v1/forminit.js`），成功以服务端返回的 `data.hashId` 判定。
- 换用新的表单时，只需在 [app.forminit.com](https://app.forminit.com) 创建表单、复制其 Form ID 替换上面的值。
- 页面字段按 Forminit 规范命名，无需在后台预制字段，首次提交自动建立字段模式。

### 后台查看与首次测试

1. 用 HBuilderX 运行页面，完整填写（含照片）提交一次。
2. 登录 [app.forminit.com](https://app.forminit.com) → 打开该表单 → 提交列表（Inbox）查看记录与照片。
3. 建议在 **Settings → Blocks** 把英文字段名改成中文标签（如 `selfIntro` → 自我介绍），展示更友好。

### 字段映射

| 表单字段 | 后台字段名 | 类型 |
| --- | --- | --- |
| 姓名 | `fi-sender-fullName` | 提交者信息 |
| 邮箱 | `fi-sender-email` | 提交者信息 |
| 专业 | `fi-text-major` | 文本 |
| 电话 | `fi-text-phone` | 文本 |
| 面试部门 | `fi-radio-department` | 单选 |
| 自我介绍 | `fi-text-selfIntro` | 文本 |
| 优势 | `fi-text-advantages` | 文本 |
| 能力标签 | `fi-checkbox-abilities[]` | 复选框（多选数组） |
| 隐私同意 | `fi-checkbox-consent` | 值固定 `yes` |
| 来源标识 | `fi-text-source` | 文本，固定 `pifu-2027-web` |
| 个人照片 | `fi-file-photo` | 文件（已压缩为 JPEG） |
| 蜜罐（反垃圾） | `_gotcha` | 留空即可 |

### 邮件通知（含多个收件人）

1. 进入表单后点表单顶部的 **Workflow**。
2. 如果在“Submission received”下还没有 **Send email notification** 步骤，点 **+** 添加；有则直接点开该步骤。
3. **To（收件人）支持多个邮箱，用英文逗号分隔**，例如：`面试联系人A@xx.com, 面试联系人B@xx.com`——每个新报名提交后，所有收件人都会同时收到同一封面试报名邮件。
4. 需要部分人只读不对外可见时，用 **Cc / Bcc** 字段（同样支持逗号分隔多个邮箱）。
5. 建议配置：
   - **Subject**：`新报名 {{sender.fullName}} · {{@submission_id}}`（避免邮件被串成同一条会话）；
   - **Reply-to**：`{{sender.email}}`（直接回复即可联系到报名者）。
6. 修改完成后点 **Publish** 才会生效。

### 注意事项

- **公开模式**：前端页面无服务器存放密钥，表单需保持 Public 认证模式；更高限流或私有模式需自建服务器用 `X-API-KEY` 转发。
- **限流**：公开模式同一 IP 每 5 秒限 1 次提交，测试时请勿连点。
- **文件限制**：Forminit 单次提交上限 25MB；照片已在浏览器端压缩，完全在限制内。
- **反垃圾**：页面已内置 `_gotcha` 蜜罐字段，可在 Forminit 后台开启 Honeypot 防护；如需更严格防刷，可再接入 Turnstile / reCAPTCHA。
- **垃圾邮件检查**：若测试提交成功但邮件/记录没到，检查后台 **Spam**——后台设置了 Authorized domains 但你从其他域名（如 localhost）测试时，提交会进 Spam。
- **自动通知**：在后台开启 Email Notifications（新报名邮件提醒）、Google Sheets（报名表实时同步）或 Slack / Discord 通知。
- **file:// 直接打开**：若双击 `index.html` 运行，跨域提交可能被浏览器拦截，建议用 HBuilderX“运行到浏览器”或本地服务器方式访问。

## 修改招新信息

- **页面文案、组别描述、流程**：直接在 `index.html` 中搜索并修改。
- **部门标签、能力标签**：在 `js/app.js` 顶部的 `DEPARTMENTS` 对象中维护。
- **主题色**：在 `css/style.css` 顶部的 `:root` 中修改 `--blue`、`--cyan`、`--red` 等变量。
- **队徽与主视觉**：替换 `assets/team-logo.png`、`assets/mech-ant.svg` 即可。
- **默认招募提示**：如“面向全校在读学生”“信息仅用于本次招新”等文字，请根据战队实际情况调整。

## 校验规则

| 字段 | 规则 |
| --- | --- |
| 姓名 | 2–20 个字符 |
| 专业 | 2–40 个字符 |
| 电话 | 中国大陆 11 位手机号，可带 `+86`、空格或连字符 |
| 邮箱 | 常规邮箱格式 |
| 自我介绍 | 20–600 字 |
| 优势 | 10–300 字 |
| 面试部门 | 必选一个 |
| 个人照片 | 必传，JPG / PNG / WebP，原始文件 ≤ 5MB |
| 隐私同意 | 必须勾选 |

照片会在浏览器内通过 Canvas 压缩为最长边 1400px 的 JPEG（质量约 0.88），再随表单提交。

## 浏览器兼容性

针对现代 Chromium 浏览器设计，已在 **Microsoft Edge 157** 上完成响应式与交互验证：

- 覆盖 320 / 390 / 820 / 1440 宽度的布局检查；
- 上一版桌面端与移动端 55 项交互和布局检查全部通过，详见 `screenshots/test-results.json`；
- 同时验证了直接双击 `index.html`（`file://`）打开时，样式、脚本、图片、队徽与本地存储均可正常工作。
- 队训视觉层另在 320 / 390 / 768 / 1024 / 1440 宽度下复检，首屏标题、印章与页脚均无横向溢出。

建议使用最新版 Chrome / Edge，或更新到最新版 HBuilderX 的内置浏览器。旧版浏览器可能出现部分装饰性渐变或毛玻璃效果降级，但不影响表单核心流程。

## 说明

- 页面中的队徽与机甲蚁插画为本项目本地素材，不依赖外网图片或字体，断网也能正常显示。
- 如正式上线，请补充真实的战队联系方式、隐私政策与数据保存期限，并在服务器端再次校验提交数据。
