# Git日常开发使用规范



## 各分支的使用说明
1. master: 主分支，永远保持稳定和可发布的状态。
2. develop: 开发分支，用于集成所有的开发分支，代表最新的开发进度，功能分支、发部分支、修复分支，都需要从这里分支出去，最终合并回这里
    1. develop分支除了最开始由master分支创建，后续不会和master交互，当需要发布和修复时，会将发布分支和修复分支同时合并到 develop和master分支
3. feature: 特性分支，用于开发新功能，从develop分支创建，在多次 commit 后完成了新功能开发时合并回 develop分支，命名规范：feature/feature-name
4. release: 发布分支，发布分支从develop分支创建，用于最后的测试和修复，最后合并回 develop和master分支，并打上发布标签,命名规范：release/release-name
5. hotfix: 修复分支，一般常用于紧急bug修复，从master分支创建，在修复完成后合并回master和develop分支，并打上版本标签，命名规范：hotfix/hotfix-name

## 场景说明
1. 项目创建
   1. 远程仓库创建项目
   2. 本地创建项目，执行 git init ，通过 git remote add origin <远程.git> 添加远程分支
   3. 本地将所有需要同步文件 commit 到本地仓库
   4. 通过 git rebase origin/master master 合并初始化代码，以远程代码为基础
   5. 通过 git push origin master 将代码提交到远程 master 分支
      1. origin 远程分支别名
      2. master 本地需要推送分支
   6. 项目初始化完成后，禁用主分支推送功能，主分支仅接受来自合并的改动请求
2. 创建开发分支
   1. 在远程仓库，通过页面创建 develop 分支
3. 开发任务
   - 先clone项目到本地
   - 通过 git checkout -b develop origin/develop 拉取并切换到develop分支
   - 通过 git checkout -b feature-<*> 由 develop 创建并切换到特性分支
   - 进行开发任务
   - 完成开发任务和自测后，切换到 develop 分支，将代码通过 git merge feature-<*> 合并至develop分支
   - 通过git push 将本地 develop 分支代码提交到远程仓库 （push 前先通过 pull 拉取develop分支代码，确保提交时本地的代码是最新状态）
4. 发布任务
   - 从需要发布的 develop 节点检出分支 git checkout -b release-<*> develop ,这里develop可以替换为指定历史记录
   - 进行测试和修复工作，验证无误后，将 代码合并至 develop 和 master 分支
5. bug修复
   - 通过 master 分支检出 hotfix 分支，并进行 bug 修复工作
   - 修改测试无误后，将代码合并至 develop 和 master 分支