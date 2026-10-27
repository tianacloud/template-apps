# 舞蹈练习模拟器

16拍舞蹈和啦啦队编排工具，包含三维舞台、动作库、训练、模拟比赛、单机斗舞、闯关和本地音乐分析。自定义动作保存在当前浏览器；编排与导入文件仅在当前页面会话中。评分为模拟结果，不替代专业训练指导。

使用 `tiana web init-template wb-dance-studio --dir PROJECT_DIR --json` 获取工程。依据 metadata.json 填写 Git 实例绑定；应用无需 SQLite。安装依赖后执行 `npm run build -- FULL_COMMIT` 构建，`npm run build:local` 用于本地检查。可调整舞台、动作和配色。
