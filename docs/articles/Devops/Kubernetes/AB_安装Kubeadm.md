# 安装Kubeadm {#install-kubeadm}

## 安装准备
- 更新`apt`包索引并安装 Kubernetes `apt` 仓库所需要的包：
```bash
# 先移除之前安装 containerd 时加入的 docker apt 仓库
rm -rf /etc/apt/sources.list.d/docker.list
apt-get update
# apt-transport-https 可能是一个虚拟包（dummy package）；如果是的话，你可以跳过安装这个包
apt-get install -y apt-transport-https ca-certificates curl gpg
```
- 下载用于 Kubernetes 软件包仓库的公共签名密钥。所有仓库都使用相同的签名密钥，因此你可以忽略URL中的版本：
> 如果 `/etc/apt/keyrings` 目录不存在，则应在 curl 命令之前创建它，如下所示：
```bash
sudo mkdir -p -m 755 /etc/apt/keyrings
```
> 下载并导入 Kubernetes 软件包仓库的公共签名密钥：
```bash
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```
- 添加 Kubernetes 软件包仓库到 `apt` 源列表：
> 此操作会覆盖 /etc/apt/sources.list.d/kubernetes.list 中现存的所有配置。
```bash
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
```
- 更新`apt`包索引并安装 `kubelet`、`kubeadm`、`kubectl` , 并锁定版本：
```bash
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
```

## 准备初始化时所需镜像

我们先看下初始化需要的镜像有哪些：
```bash
kubeadm config images list
```

我们可以看到需要拉取的镜像有：
```text
registry.k8s.io/kube-apiserver:v1.30.2
registry.k8s.io/kube-controller-manager:v1.30.2
registry.k8s.io/kube-scheduler:v1.30.2
registry.k8s.io/kube-proxy:v1.30.2
registry.k8s.io/coredns/coredns:v1.11.1
registry.k8s.io/pause:3.9
registry.k8s.io/etcd:3.5.12-0
```

> [!tip] 这些镜像因为网络问题，直接拉取是无法拉取的

我这里先通过设置临时系统代理，然后通过 ctr 下载到
```bash
export https_proxy=http://192.168.1.111:7890
```
然后手动拉取这些镜像：
> `Containerd` 的镜像是区分命名空间的，`Kubernetes`需要指定命名空间 `k8s.io`
```bash
ctr -n k8s.io images pull registry.k8s.io/kube-apiserver:v1.30.2 
ctr -n k8s.io images pull registry.k8s.io/kube-controller-manager:v1.30.2 
ctr -n k8s.io images pull registry.k8s.io/kube-scheduler:v1.30.2 
ctr -n k8s.io images pull registry.k8s.io/kube-proxy:v1.30.2 
ctr -n k8s.io images pull registry.k8s.io/coredns/coredns:v1.11.1 
ctr -n k8s.io images pull registry.k8s.io/pause:3.9 
ctr -n k8s.io images pull registry.k8s.io/etcd:3.5.12-0 
```
拉取完成后可通过 `ctr -n k8s.io images list` 查看拉取的镜像

移除全局变量中的代理设置,否则会导致 `kubeadm init` 异常
```bash
unset https_proxy
```

> 这里的镜像准备是为了下一节的初始化操作做准备。

> [!tip] 这里完成后可以给虚拟机打快照


## 总结
至此，Kubernetes 集群的安装准备工作已经完成。

下一步将介绍如何初始化 Kubernetes 集群。




