# CCS 慢慢上手

一份面向 CCS 新手的中文交互手册：真实软件截图、设置窗口逐项说明和可以照着做的练习。采用温暖配色和大字号排版。

**在线访问：https://wuqi57good.github.io/ccs-guide/**

## 已包含的内容

- 45 张 TI 官方原始截图：33 张 Theia、12 张 Eclipse，可原尺寸查看和放大。
- 9 个界面区域、9 类设置、5 个专题、83 项任务索引及 7 天学习路线。
- Theia 主线与 Eclipse 对照、浅色/深色主题、章节导航、路径复制、学习进度保存。
- Cortex-A53 / AArch64 裸机、GNU aarch64-elf-、XDS200 的使用场景说明。

## 直接使用

在线打开上述地址即可。下载本仓库后，也可以直接双击根目录的 **index.html** 离线阅读；也可把它另存或改名为 **ccs-guide.html**。

网页运行只需要 index.html：CSS、JavaScript、全部截图均已内嵌，不依赖 CDN、外链字体或外链图片。只有主动打开官方参考链接时需要联网。学习进度保存在当前浏览器本地，不会上传到服务器；在线版与本地文件的进度不会自动同步。

## 文件与修改方法

- index.html：GitHub Pages 入口，也是可独立使用的离线手册。
- src/template.html：页面结构。
- src/style.css、src/photos.css：页面与截图阅读器样式。
- src/app.js、src/photos.js：交互逻辑。
- src/regions.js、src/topics.js、src/settings.js：教学数据。
- src/screenshots-manifest.json：逐图来源、尺寸、读图提示和章节映射。
- src/screenshots/：45 张原始 PNG 图片。
- src/build.cjs：生成脚本，仅使用 Node.js 内置模块，无需 npm install。
- ATTRIBUTION.md：截图和技术资料来源。
- VALIDATION.md：已执行的验证与适用边界。
- .nojekyll：让 GitHub Pages 直接发布静态文件。

修改 src 中的文件后，在仓库根目录运行：

~~~sh
node src/build.cjs
~~~

提交更新后的源码和 index.html。GitHub Pages 配置为 **Deploy from a branch → main → / (root)**，推送后会更新网站。

## 适用边界

主线界面依据 CCS 20.5.1 官方手册，对照图依据 CCS 12.8 官方手册。官方手册可能沿用较早截图，来源版本不代表每张图的实际构建版本。图注明确区分 MSPM0、TI Clang、XDS110、C2000 等示例与 A53 / GNU / XDS200 场景。

此页面没有连接真实硬件执行验证。具体 SoC/板卡、SDK、CCS 小版本及 GNU 插件页面仍需与实际环境对应；DDR 初始化、烧录、运行中刷新与计时支持不能由截图保证。完整不足及扩展方向见页面相应章节。

## 来源与权利说明

TI 截图、商标及引用资料的权利归原权利人所有；来源见 ATTRIBUTION.md 和每张图的来源链接。本仓库不是 TI 官方产品，不对第三方资料附加开放源码许可。
