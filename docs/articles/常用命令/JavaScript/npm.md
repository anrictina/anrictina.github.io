# NPM {#npm}

## `NPM` 常用命令 {#npm-common-commands}

```shell
# 安装当前目录下的 package.json 依赖
npm install

# 使用指定 npm 源安装依赖
npm install --registry=https://registry.npmmirror.com

# 安装指定版本的依赖
npm install <package>@4.16.3

# 安装指定版本的依赖，并将其写入 package.json 文件
npm install <package>@4.16.3 --save

# 安装指定版本的依赖，并将其写入 package.json 文件，并将依赖添加到devDependencies
npm install <package>@4.16.3 --save-dev

# 卸载依赖
npm uninstall <package>

# 列出所有本地依赖
npm list

# 列出所有全局依赖
npm list -g

# 查看全局安装的 npm 版本
npm -v

# 查看本地安装的 npm 版本
npm --version

# 查看 npm 帮助
npm help

# 查看 npm 命令的详细帮助
npm help <command>
```
