# Git 绑定github令牌

## 创建 github 令牌
1. 登陆后点击右上角个人头像，按照以下顺序依次进行
2. Settings -> Developer Settings -> personal-access-tokens -> Fine-grained tokens
3. 点击 `Generate new token` 后续按照你的要求划分仓库和指定权限
4. 复制保存生成的token，当然这个可以重新生成（重新生成后之前的会无效）

## 绑定令牌
1. 绑定令牌有两种方式：1.全局绑定 2.仅当前项目绑定
::: code-group
```shell[全局绑定]
git config --global credential.helper store
```
```shell[仅当前项目]
git config --local credential.helper store
```
:::

2. 执行push推送时，输入 `Password` 时 将 token 填入即可
3. 上述第一步可不执行，但是后续每次 push 推送都会让你输入用户名和密码