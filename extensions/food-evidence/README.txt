「一口看文献」食品文献证据扩展 v1

直接预览
解压后，打开 extensions/food-evidence/preview.html。卡片内容在本地加载，点击论文链接时访问原网站。

接入「这一口」
完整新版已接入。本扩展可以单独维护。将 food-evidence 文件夹放在项目的 extensions 下。
在 index.html 加载 evidence.css，并在 app.js 前依次加载 oats.js 和 evidence.js。
在应用里用 FoodEvidence.entry() 生成入口、FoodEvidence.renderPage() 渲染证据页、FoodEvidence.labelLink(名称, 配料文字) 生成包装页入口。入口按钮使用宿主 app 的 data-page="evidence" 路由。

更新证据
oats.js 保存成分介绍、论文数据和检索记录。更新时应核对原文的人群、剂量、对照、观察时间、研究结局和 DOI。
