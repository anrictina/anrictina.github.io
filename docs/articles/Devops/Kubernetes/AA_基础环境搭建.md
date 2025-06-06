# 基础环境搭建 {#basic-environment-setup}

::: tip 提示
本文环境如下：

1. 操作系统：Debian 12 [Debian 12]
2. Kubernetes 版本：v1.30.0
3. Containerd 版本: 1.7.18.1
[Kubernetes官方文档](https://kubernetes.io/zh-cn/docs/home/)

Kubernetes 对于每台[机器的要求](https://kubernetes.io/zh-cn/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#verify-mac-address)是：
- 2GB或更多的内存
- CPU为2核心及以上
- 集群中所有机器的网络可以互相连接。
- 节点之间不可以有重复的主机名、MAC地址或product_uuid。
- 需要确保某些端口可用[需要开放的端口](https://kubernetes.io/zh-cn/docs/reference/networking/ports-and-protocols/)
- 交换分区的配置。kubelet 的默认行为是在节点上检测到交换内存时无法启动。

注意：本文所用用户为root，若非root用户，请使用sudo或su切换到root用户（Debian12默认是不开启sudo功能的，需要自行配置）。
:::

## 环境配置

1. 启用 IPv4 数据包转发
默认情况下，Linux 内核不允许 IPv4 数据包在接口之间路由。

手动启用 IPv4 数据包转发

- 设置所需的 sysctl 参数，参数在重新启动后保持不变
```bash 
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
EOF
```
- 应用 sysctl 参数而不重启
```bash
sysctl --system
```

- 使用以下命令验证 net.ipv4.ip_forward 是否为 1 (为1表示启用 IPv4 数据包转发)
```bash
sysctl net.ipv4.ip_forward
```

2. 关闭虚拟内存
正常应该在安装时就关闭了虚拟内存，我之前安装系统时图方便就选的的默认分区方案，所以需要手动关闭。

先关闭 Swap 分区
```bash
swapoff -a
```
上面的命令是临时关闭,可以通过以下方式实现永久生效

修改配置文件，注释掉 swap 相关的行
```text{4}
# / was on /dev/sda1 during installation
UUID=61ad57fb-490e-4887-af39-0ba2911abbc6 /               ext4    errors=remount-ro 0       1
# swap was on /dev/sda5 during installation
#UUID=a2d855e7-176a-46ea-a0be-016d0c564b08 none            swap    sw              0       0
/dev/sr0        /media/cdrom0   udf,iso9660 user,noauto     0       0
```
**重启** 
> [!CAUTION] 如果你的系统存在运行中的任务，慎重重启
```bash
reboot
```

完成后重启即可永久禁用 Swap 分区


## 安装 Containerd {#install-containerd}

本文中我们选择 `Containerd` 作为 `Kubernetes` 容器运行时

[Containerd 官方指导文档](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)

这里我们使用apt安装，由于 `Docker` 目前也是使用 `containerd` 作为容器运行时，所以 `containerd` 官方也将 apt 安装的方式指向了 [docker安装文档](https://docs.docker.com/engine/install/debian/)


### 通过 `apt` 安装 `containerd`
- 配置 Docker 的存储库
```bash
apt-get update
apt-get install ca-certificates curl 
install -m 0755 -d /etc/apt/keyrings

# 由于docker官方地址被墙问题，这里推荐通过代理，或者自己下载文件后上传解决
# 我这里通过代理下载文件，注释的属于无需代理的命令
# curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc --proxy http://192.168.1.111:7890 

chmod a+r /etc/apt/keyrings/docker.asc

# 将 Docker 的存储库添加到 apt 源列表中

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
   tee /etc/apt/sources.list.d/docker.list > /dev/null


# 更新 apt 包索引

# 我这里同样通过代理执行
# apt-get update
apt-get -o Acquire::http::Proxy="http://192.168.1.111:7890" update

```

- apt-get 安装 containerd.io 包
  虽然我们用的是 `Docker` 的存储库，但是我们只需要安装需要的 `containerd` 包即可
```bash
# apt install -y containerd.io
# 网络问题，这里继续使用代理
apt-get -o Acquire::http::Proxy="http://192.168.1.111:7890" install -y containerd.io
```


### 通过下载 deb 包安装 `containerd`

如果无法通过代理访问的情况下，如内网环境可以通过在外网下载好对应的 deb 包，然后上传至需要安装的服务器

[docker软件包列表](https://download.docker.com/linux/debian/dists/bookworm/pool/stable/amd64/)

::: tip 注意
这里我使用的是 Debian 12 的 bookworm 版本，以及 amd64 架构，其它版本和架构注意修改。
:::

需要下载的软件包（这里我安装的版本属于最新版，你也可以根据需要自行修改）：
- [containerd.io_1.7.18-1_amd64.deb](https://download.docker.com/linux/debian/dists/bookworm/pool/stable/amd64/containerd.io_1.7.18-1_amd64.deb)

将下载的软件包上传至服务器，然后在文件所在目录执行以下命令安装：

```bash
dpkg -i containerd.io_1.7.18-1_amd64.deb
```






### 测试 containerd
```bash
# ctr 是 containerd 命令行工具
# ctr -v 显示当前 containerd 版本
ctr -v
# ctr i ls 列出本地镜像
ctr i ls
```
如图：
![containerd-install-after](/devops/linux/containerd-install-after.png)

`containerd` 安装完成

## 调整配置

安装 containerd 后的默认配置文件内容很简单，而且不包含后续需要调整的配置内容，这里我们通过创建默认配置来替代：
```bash
containerd config default > /etc/containerd/config.toml
```
1. 调整 CRI 支持
::: warning 注意
你需要启用 CRI 支持才能在 `Kubernetes` 集群中使用 `containerd`。

我们通过上述命令创建的 `config.toml` 文件中 `disabled_plugins` 列表内是没有出现 cri 的，但是你也需要自行检查确认。

要确保 cri 没有出现在 `/etc/containerd/config.toml` 文件中 `disabled_plugins` 列表内。

如果你更改了这个文件，也请记得要重启 `containerd`。
:::

2. 配置 systemd cgroup 驱动

结合 `runc` 使用 `systemd cgroup` 驱动，在 `/etc/containerd/config.toml` 中设置：
```text
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  ...
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
    SystemdCgroup = true
```

3. 设置 `Containerd` 基础镜像
```bash
sed -i 's/registry.k8s.io\/pause:3.8/registry.k8s.io\/pause:3.9/g' /etc/containerd/config.toml
```

**重启 containerd**
```bash
systemctl restart containerd
```




