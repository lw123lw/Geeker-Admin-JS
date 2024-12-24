# Geeker-Admin-JS

### 介绍 📖

Geeker-Admin-JS 一款基于 Vue3.4、Vite5、Pinia、Element-Plus 开源的后台管理框架，使用目前最新技术栈开发。项目提供强大的 [ProTable](https://juejin.cn/post/7166068828202336263) 组件，在一定程度上提高您的开发效率。另外本项目还封装了一些常用组件、Hooks、指令、动态路由、按钮级别权限控制等功能。

### 在线预览 👀

- Link：https://geeker.liwei.online/

### 代码仓库 ⭐

- Gitee：https://gitee.com/haimashale/geeker-admin-js
- GitHub：https://github.com/lw123lw/Geeker-Admin-JS

### TS版本代码仓库 ⭐

- Gitee：https://gitee.com/HalseySpicy/Geeker-Admin
- GitHub：https://github.com/HalseySpicy/Geeker-Admin

### 项目文档 📚

- 项目更新日志：[CHANGELOG.md](./CHANGELOG.md)

- 项目文档地址：https://docs.spicyboy.cn

### 项目功能 🔨

- 使用 Vue3.4，单文件组件**＜script setup＞**
- 采用 Vite5 作为项目开发、打包工具（配置 gzip/brotli 打包、jsx 语法、跨域代理…）
- 使用 Pinia 替代 Vuex，轻量、简单、易用，集成 Pinia 持久化插件
- 基于 Element 二次封装 [ProTable](https://juejin.cn/post/7166068828202336263) 组件，表格页面全部为配置项 Columns
- 支持 ProTable 树状表格图谱化展示
- 支持 Element 组件大小切换、多主题布局、暗黑模式、i18n 国际化
- 使用 VueRouter 配置动态路由权限拦截、路由懒加载，支持页面按钮权限控制
- 使用 KeepAlive 对页面进行缓存，支持多级嵌套路由缓存
- 常用自定义指令开发（权限、复制、水印、拖拽、节流、防抖、长按…）
- 使用 Prettier 统一格式化代码，集成 ESLint、Stylelint 代码校验规范
- 使用 husky、lint-staged、commitlint、czg、cz-git 规范提交信息

### 树状表格图谱功能列表 🚙

- 数据层级关系可视化调整，允许在 ProTable 组件配置是否允许跨层级展示，数据层级调整完成切换到表格将自动调整原数据层级关系
- 图谱右键功能菜单，可自定义实现所需功能，默认展示详情、编辑、删除按钮
- 图谱的搜索引用 ProTable 的搜索框实现，可模糊搜索，若查到多条结果则依次定位到节点并自动选中展示
- 图谱自动调整位置，支持导出为png图片，可全屏展示
- 图谱默认允许鼠标悬浮节点后高亮显示所直接关联的节点，其他节点变暗
- ProTable 图谱功能展示

![video](https://gitee.com/haimashale/geeker-admin-js/raw/master/md-resources/protable-graph.gif)

### 环境配置 ⚙️

- `Node` ：18.12.0
- `pnpm` ：9.7.0
- `npm` ：10.8.2

### 安装使用步骤 📔

- **Clone：**

```text
# Gitee
git clone https://gitee.com/haimashale/geeker-admin-js.git
或者
git clone https://github.com/lw123lw/Geeker-Admin-JS.git
```

- **Install：**

```text
pnpm install
```

- **Run：**

```text
pnpm dev
pnpm serve
```

- **Build：**

```text
# 开发环境
pnpm build:dev

# 测试环境
pnpm build:test

# 生产环境
pnpm build:pro
```

- **Lint：**

```text
# eslint 检测代码
pnpm lint:eslint

# prettier 格式化代码
pnpm lint:prettier

# stylelint 格式化样式
pnpm lint:stylelint
```

- **commit：**

```text
# 提交代码（提交前会自动执行 lint:lint-staged 命令）
pnpm commit
```

### 项目截图 📷

- 表格图谱：
  ![table_graph_dark](./public/readme/graph2.png)
  ![table_graph_light](./public/readme/graph.png)

- 登录页：

![login_light](https://i.imgtg.com/2023/04/13/8tknp.png)

![login_dark](https://i.imgtg.com/2023/04/13/8tmpP.png)

- 首页：

![home_light](https://i.imgtg.com/2023/04/13/8tl1j.png)

![home_dark](https://i.imgtg.com/2023/04/13/8tpfb.png)

- 表格页：

![table_light](https://i.imgtg.com/2023/04/13/8tfMx.png)

![table_dark](https://i.imgtg.com/2023/04/13/8tv8F.png)

- 数据可视化

![dashboard](https://i.imgtg.com/2023/04/14/82Grx.png)

- 数据大屏：

![dataScreen](https://i.imgtg.com/2023/01/16/QP8HF.png)

### 文件资源目录 📚

```text
Geeker-Admin
├─ .husky                  # husky 配置文件
├─ .vscode                 # VSCode 推荐配置
├─ build                   # Vite 配置项
├─ public                  # 静态资源文件（该文件夹不会被打包）
├─ src
│  ├─ api                  # API 接口管理
│  ├─ assets               # 静态资源文件
│  ├─ components           # 全局组件
│  ├─ config               # 全局配置项
│  ├─ directives           # 全局指令文件
│  ├─ hooks                # 常用 Hooks 封装
│  ├─ languages            # 语言国际化 i18n
│  ├─ layouts              # 框架布局模块
│  ├─ routers              # 路由管理
│  ├─ stores               # pinia store
│  ├─ styles               # 全局样式文件
│  ├─ utils                # 常用工具库
│  ├─ views                # 项目所有页面
│  ├─ App.vue              # 项目主组件
│  ├─ main.js              # 项目入口文件
├─ .editorconfig           # 统一不同编辑器的编码风格
├─ .env                    # vite 常用配置
├─ .env.development        # 开发环境配置
├─ .env.production         # 生产环境配置
├─ .env.test               # 测试环境配置
├─ .eslintignore           # 忽略 Eslint 校验
├─ .eslintrc.cjs           # Eslint 校验配置文件
├─ .gitignore              # 忽略 git 提交
├─ .prettierignore         # 忽略 Prettier 格式化
├─ .prettierrc.cjs         # Prettier 格式化配置
├─ .stylelintignore        # 忽略 stylelint 格式化
├─ .stylelintrc.cjs        # stylelint 样式格式化配置
├─ CHANGELOG.md            # 项目更新日志
├─ commitlint.config.cjs   # git 提交规范配置
├─ index.html              # 入口 html
├─ LICENSE                 # 开源协议文件
├─ lint-staged.config.cjs  # lint-staged 配置文件
├─ package-lock.json       # 依赖包包版本锁
├─ package.json            # 依赖包管理
├─ postcss.config.cjs      # postcss 配置
├─ README.md               # README 介绍
└─ vite.config.js          # vite 全局配置文件
```

### 浏览器支持 🌎

- 本地开发推荐使用 Chrome 最新版浏览器 [Download](https://www.google.com/intl/zh-CN/chrome/)。
- 生产环境支持现代浏览器，不再支持 IE 浏览器，更多浏览器可以查看 [Can I Use Es Module](https://caniuse.com/?search=ESModule)。

| ![IE](https://i.imgtg.com/2023/04/11/8z7ot.png) | ![Edge](https://i.imgtg.com/2023/04/11/8zr3p.png) | ![Firefox](https://i.imgtg.com/2023/04/11/8zKiU.png) | ![Chrome](https://i.imgtg.com/2023/04/11/8zNrx.png) | ![Safari](https://i.imgtg.com/2023/04/11/8zeGj.png) |
| :---------------------------------------------: | :-----------------------------------------------: | :--------------------------------------------------: | :-------------------------------------------------: | :-------------------------------------------------: |
|                   not support                   |                  last 2 versions                  |                   last 2 versions                    |                   last 2 versions                   |                   last 2 versions                   |

### 项目后台接口 🧩

项目后台接口完全采用 Mock 数据，感谢以下 Mock 平台支持：

- FastMock： https://www.fastmock.site
- EasyMock：https://mock.mengxuegu.com

### 感谢 ❤️

- [RelationGraph](https://www.relation-graph.com/#/index)
