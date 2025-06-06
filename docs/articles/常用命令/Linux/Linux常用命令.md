# Linux常用命令 {#linux-common-commands}

## 常用命令附加代理 {#common-commands-proxy}
`curl`通过代理地址访问
```bash
curl http://www.example.com --proxy http://<ip>:<port>
```

`apt update`通过代理更新镜像源
```bash
apt -o Acquire::http::Proxy "http://<ip>:<port>" update
```

设置会话代理
```bash
export http_proxy="http://<ip>:<port>"
```

## 常见命令

tar压缩文件
```bash
tar -zcvf <file_name>.tar <file_name>
```

解压tar压缩文件
```bash
tar -zxvf <file_name>.tar
```

替换文件内容
```bash
sed -i 's/<old_string>/<new_string>/g' <file_name>
```



## 系统管理命令
查看环境变量
```bash
# 查看所有环境变量
env | grep <keyword>

# 查看PATH环境变量
echo $PATH

# 查看指定环境变量
echo $<variable_name>

```

查看 `systemd` 应用日志
```bash
journalctl -u <unit_name>
```

变更系统名和本地域名（hostname）
```shell
hostnamectl set-hostname <主机名>
```

变更主机时间
> Ubuntu24默认时区不是上海，需要手动变更

:::code-group
```shell[变更时区]
dpkg-reconfigure tzdata
```
```shell[查看当前时区]
timedatectl 
```
:::
