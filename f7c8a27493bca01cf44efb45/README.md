# FORMA 3D

浏览器中查看和转换 3D 模型。打开模型或包含材质、贴图的文件夹，使用视图、灯光与渲染控件检查，再选择导出格式。模型仅在当前浏览器处理，不提供云端模型保存。需要 WebGL 2，支持格式及转换限制见应用帮助和导出面板。

运行 `npm ci && npm run build` 生成 dist。将 source.json 中的 Git 占位符替换为本应用的 Git 实例 ID；入口为 assets/app.js。将 SQLite 占位符替换为本应用数据库实例 ID，并执行 schema.sql。GPU 偏好保存在应用数据库。
