# Git拉取仓库代码并提交

## 拉取远程代码
```git
git clone <仓库地址>
```

## 设置你的账户信息
```gitignore
git config --global credential.helper store
git config --global user.email "<email>"
git config --global user.name "<name>"
```

## 本地修改代码后
```gitexclude
git add <修改的文件>

git commit -m "<修改说明>"
```

## 推送代码

```shell
git push origin <本地分支>:<远程分支>
```
> 注意
```shell
git pull 或 git push 后续格式都是基于 <source>:<target> 的格式，也就是 <源变更分支>:<目标变更分支>
```