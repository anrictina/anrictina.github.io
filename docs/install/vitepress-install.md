# 自建 VitePress 文档站点 {#vitepress-install}

> [!TIP] 注意
> 本文档所用
> - VitePress@1.2.3 
> - Node.js@v20.15.0(官方说18以上版本即可)
>
> 本文档是我个人安装学习记录，仅供参考，如有需要可查看 [VitePress 官方文档](https://vitepress.dev/zh)

### 前置准备 {#prerequisites}

```sh [npm]
npm install -D vitepress
```

## 安装向导  {#create-project}
根据 VitePress 附带的命令行向导创建项目
```sh [npm]
npx vitepress init
```


将要回答几个简单的问题:

<<< @/public/vitepress-install/init.ansi

:::tip 提示
回答完毕后，会在当前目录下创建一个名为 `docs` 的目录，里面包含了 VitePress 的基本配置。
:::
![VitePress 初始化目录](/public/vitepress-install/vitepress-init.png)

此时可以运行 `npm run docs:dev` 命令启动本地开发服务器，并在浏览器中访问 [http://localhost:5173](http://localhost:5173) 预览站点。

## 目录结构 {#file-structure}

如果正在构建一个独立的 VitePress 站点，可以在当前目录 (`./`) 中搭建站点。但是，如果在现有项目中与其他源代码一起安装 VitePress，建议将站点搭建在嵌套目录 (例如 `./docs`) 中，以便它与项目的其余部分分开。

假设选择在 `./docs` 中搭建 VitePress 项目，生成的文件结构应该是这样的：

::: code-group

```[VitePress官方的目录结构]
.  
├─ docs 
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

```[我的目录结构]
.  
├─ .github
│  └─ workflows
│     └─ deploy.yml
├─ docs 
│  ├─ .vitepress
│  │  └─ config.mts
│  ├─ articles
│  │  └─ <分类目录>
│  │        └─ <文档>.md
│  ├─ public
│  │  └─ <静态资源>
│  └─ index.md
└─ package.json
```
:::

> [!TIP] 注意
> 我的目录结构是根据自己的需求进行调整的，可以参考官方文档根据自己的需求进行调整。
> 
> `docs` 目录作为 VitePress 站点的项目**根目录**。
> 
>`.vitepress` 目录是 VitePress 配置文件、开发服务器缓存、构建输出和可选主题自定义代码的位置。
> 
> `articles` 目录是存放文章
> 
> `public` 目录是存放静态资源 想要修改站点的标签图标，可以在public下存入 `favicon.ico` 即可
> 
> `.github/workflows/deploy.yml` 文件是 GitHub Actions 自动部署的配置文件，可以根据自己的需求对内容进行修改 （这里目录结构要保持一致） 。我这个是网上抄的，以下附带文件内容供参考：

::: details deploy.yml
```yaml
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
#
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行。如果你
  # 使用 `master` 分支作为默认分支，请将其更改为 `master`
  push:
    branches: [main]

  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过正在运行和最新队列之间的运行队列
# 但是，不要取消正在进行的运行，因为我们希望允许这些生产部署完成
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 如果未启用 lastUpdated，则不需要
      # - uses: pnpm/action-setup@v3 # 如果使用 pnpm，请取消注释
      # - uses: oven-sh/setup-bun@v1 # 如果使用 Bun，请取消注释
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm # 或 pnpm / yarn
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci # 或 pnpm install / yarn install / bun install
      - name: Build with VitePress
        run: npm run docs:build # 或 pnpm docs:build / yarn docs:build / bun run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
:::

## 启动并运行 {#up-and-running}

`docs:dev` 脚本将启动具有即时热更新的本地开发服务器。使用以下命令运行它：

::: code-group

```sh [npm]
$ npm run docs:dev
```
:::

开发服务应该会运行在 [http://localhost:5173](http://localhost:5173) 上。在浏览器中访问 URL 以查看新站点的运行情况吧！

下一节将介绍配置相关内容。
