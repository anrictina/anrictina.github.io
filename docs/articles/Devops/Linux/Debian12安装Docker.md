# Debian12 安装 Docker

## 通过deb包进行安装
[官方deb列表地址](https://download.docker.com/linux/debian/dists/bookworm/pool/stable/amd64/)

所需下载的deb有：
- docker-ce 
- docker-ce-cli 
- containerd.io 
- docker-buildx-plugin 
- docker-compose-plugin
下面这些是iptables相关依赖，docker依赖iptables,你可以通过`apt download <package-name>`下载需要的deb
- libip6tc2
- libnetfilter-conntrack3 
- libnfnetlink0 
- iptables

将所下载deb文件上传至服务器

在服务器上文件所在目录执行安装：
> 注意：我这里是该目录只有上面下载的deb
```bash
dpkg -i *.deb
```

安装完成后，可通过 `docker ps -a` 验证