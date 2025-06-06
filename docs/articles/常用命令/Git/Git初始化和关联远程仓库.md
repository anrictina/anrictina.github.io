# Git初始化和关联远程仓库
::: tip 提示
本文环境如下:

1. 已配置好本地 git 配置，如链接远程仓库的相关认证和权限
:::

由于之前有过通过github创建仓库，本地是通过新建项目再进行关联远程仓库的经历，对于git的使用一知半解，通过该文内的项目实验，加深对git的理解

## 基本环境
1. 在github创建一个仓库
2. 在本地通过idea创建一个SpringBoot项目 （任意项目工程都可以）

## 关联远程仓库
1. 获取github上的项目地址
2. 在本地通过 `git init` 初始化git
3. 通过 `git remote add <remote-name> <*.git>` 关联远程仓库
   1. remote-name : 本地远程分支的简写
   2. *.git : 远程git仓库的地址

## 使用
1. 此时通过 idea 的可视化git工具可以看到，目前还没有远程分支
2. 运行 `git add .` 将本地项目文件加入暂存区
3. 运行 `git fetch <remote-name>` 将远程仓库同步至本地远程分支
4. 此时可以通过idea可视化工具看到，远程分支和本地分支具有不一样的历史记录
5. 运行 `git rebase origin/main` 使用远程初始化记录替换本地初始化记录，合并分支
6. 运行 `git push origin master:main` 将本地 master 分支推送到 main 分支

## 