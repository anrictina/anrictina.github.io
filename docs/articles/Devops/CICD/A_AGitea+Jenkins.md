# Gitea+Jenkins搭建自动化构建

::: tip 提示
本文环境如下：
1. gitea：1.23.3
2. jenkins: 2.492.1
:::
## 前置配置
### gitea
1. 开启webhook允许主机地址 
该文件属于gitea的配置文件
```text app.ini
[webhook]
ALLOWED_HOST_LIST = <jenkins_host>
# ALLOWED_HOST_LIST = 192.168.1.22 例如
```
### jenkins
1. 创建 gitea 账户

    在 `系统管理`->`用户管理`->`Create User` 下创建 gitea 账户

2. 创建 jenkins 账户token

    登陆 gitea 账户,在右上角点击个人管理
由 `Security` -> `添加新 token` (token后续无法查看,请自行复制保存)
例如: 1168969d9b161e1234ba6e41aedee8fad5

3. 创建 访问令牌

    在 linux 下执行
```shell
# echo -n "<账户>:<token>" | base64
# echo 要带 -n 参数,否则输出给 base64 进行加密的字符串带有换行符, 编码的结果无法使用
echo -n "gitea:1168969d9b161e1234ba6e41aedee8fad5" | base64
```
记住执行的输出,这个令牌后续会使用

4. 开启权限控制

    由 `系统管理` -> `全局安全配置` -> `授权策略` 
选择 `项目矩阵策略`, 该选项可由每个项目独立管理授权

## 自动化构建
### jenkins
1. 创建项目文件夹
2. 创建构建流水线任务
3. 配置任务
   1. 可根据需要开启项目安全,我这里给 gitea 账户开放 `任务` 的 `Build`
   2. Tiggers中选择 `触发远程构建`
   3. 内容可根据需要自行填写
   4. 如: ci_test ,则对应 `<JENKINS_URL>/job/<目录>/job/<任务>/build?token=ci_test`
   5. 流水线脚本可先使用 `hello world` 模板
   6. 保存即可

### gitea
1. 首先在`gitea`创建对应仓库
2. 在仓库设置中设置webhook
3. 创建webhook
   1. 目标URL填写 上一步创建的脚本 url `<JENKINS_URL>/job/<目录>/job/<任务>/build?token=ci_test`
   2. 根据需要自定义触发事件 和 需要触发事件的分支
   3. 授权标头: `Basic <echo输出的编码>`, 
   4. 如: `Basic Z2l0ZWE6MTE2ODk2OWQ5YjE2MWUxMjM0YmE2ZTQxYWVkZWU4ZmFkNQ==`
4. 可通过下方 `测试推送` 按钮测试是否可正常触发构建
