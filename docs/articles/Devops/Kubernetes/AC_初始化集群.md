# 初始化集群 {#init-cluster}

> [!tip] 集群 
> 因为集群一般是多台机器组成，我之前的内容都是在 `Vmware` 上完成的，这里我将之前的虚拟机直接做快照备份，然后克隆多台出来
> 
> 你可以根据你的需要来，我这里是三台虚拟机，分别是 `master` `node1` `node2`

## 准备工作 {#prepare}

> [!warning] 注意事项
> 在克隆快照后，记得把虚拟机的 `MAC` 地址重新生成一下，否则不符合 `Kubernetes` 集群的要求

- 修改主机名
```bash
# master
hostnamectl set-hostname master
sed -i 's/debian/master/g' /etc/hosts

# node1
hostnamectl set-hostname node1
sed -i 's/debian/node1/g' /etc/hosts

# node2
hostnamectl set-hostname node2
sed -i 's/debian/node2/g' /etc/hosts

```


## 使用 kubeadm 初始化集群 {#init-cluster-with-kubeadm}
[kubeadm init官方参数文档](https://kubernetes.io/zh-cn/docs/reference/setup-tools/kubeadm/kubeadm-init/)
- 使用 `kubeadm init` 命令初始化 master 节点：
```bash
kubeadm init --skip-phases=addon/kube-proxy
```
> --skip-phases=addon/kube-proxy 跳过 `kube-proxy` 的安装，因为我们不需要用到 `kube-proxy`

初始化完成后，会输出 `kubeadm join` 命令，我们需要把这个命令先保存下来，后续会使用到：
```bash
kubeadm join 192.168.1.130:6443 --token ice2m2.jdrgj8dbj5ijav76 \
        --discovery-token-ca-cert-hash sha256:1822cc0392e40fe7f1166fb87bef33c4224515d0ba428d995b915f48557f95f5 
```

这时我们可以通过 `kubectl get pods -A` 查看所有的 `pod`：
> 但是会得到如下输出
```text
E0628 21:58:03.663121    4924 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E0628 21:58:03.664002    4924 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E0628 21:58:03.665930    4924 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E0628 21:58:03.666358    4924 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
E0628 21:58:03.668334    4924 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp [::1]:8080: connect: connection refused
The connection to the server localhost:8080 was refused - did you specify the right host or port?
```
此时我们需要按照 `kubeadm init` 命令的输出，配置 `kubectl`:
::: code-group
```bash [非root用户（推荐）]
# root用户也可以使用
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```
```bash [root用户]
# 不推荐这种，会话结束后会失效
export KUBECONFIG=/etc/kubernetes/admin.conf
```
:::

然后再次运行 `kubectl get pods -A` 查看所有的 `pod`：
```text
NAMESPACE     NAME                             READY   STATUS    RESTARTS   AGE
kube-system   coredns-7db6d8ff4d-ttffb         0/1     Pending   0          8m19s
kube-system   coredns-7db6d8ff4d-xmj6m         0/1     Pending   0          8m19s
kube-system   etcd-master                      1/1     Running   0          8m28s
kube-system   kube-apiserver-master            1/1     Running   0          8m26s
kube-system   kube-controller-manager-master   1/1     Running   0          8m26s
kube-system   kube-proxy-jt6nz                 1/1     Running   0          8m19s
kube-system   kube-scheduler-master            1/1     Running   0          8m26s
```

## 安装Cilium作为CNI插件 {#install-cilium-as-cni-plugin}

::: tip 提示
[Cilium官方文档](https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/)
:::

### 安装 Cilium CLI {#install-cilium-cli}
下面的是官方提供的 Cilium CLI 安装步骤
```bash
# 老规矩，上代理,当然，你也可以自己在外网下载好上传
# CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt --proxy http://192.168.1.111:7890)
CLI_ARCH=amd64
if [ "$(uname -m)" = "aarch64" ]; then CLI_ARCH=arm64; fi
# curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum} --proxy http://192.168.1.111:7890
sha256sum --check cilium-linux-${CLI_ARCH}.tar.gz.sha256sum
# 执行完成会显示： cilium-linux-amd64.tar.gz: OK

tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
```

### 安装 Cilium 组件 {#install-cilium-components}
```bash
cilium install
```
执行后需要等待一段时间，直到所有组件都启动完成。

检查 Cilium 组件状态：
```bash
cilium status --wait
```
```text
    /¯¯\
 /¯¯\__/¯¯\    Cilium:             OK
 \__/¯¯\__/    Operator:           OK
 /¯¯\__/¯¯\    Envoy DaemonSet:    disabled (using embedded mode)
 \__/¯¯\__/    Hubble Relay:       disabled
    \__/       ClusterMesh:        disabled

DaemonSet              cilium             Desired: 1, Ready: 1/1, Available: 1/1
Deployment             cilium-operator    Desired: 1, Ready: 1/1, Available: 1/1
Containers:            cilium             Running: 1
                       cilium-operator    Running: 1
Cluster Pods:          2/5 managed by Cilium
Helm chart version:    
Image versions         cilium-operator    quay.io/cilium/operator-generic:v1.15.5@sha256:f5d3d19754074ca052be6aac5d1ffb1de1eb5f2d947222b5f10f6d97ad4383e8: 1
                       cilium             quay.io/cilium/cilium:v1.15.5@sha256:4ce1666a73815101ec9a4d360af6c5b7f1193ab00d89b7124f8505dee147ca40: 1
```

通过 `kubectl get pods -A` 可以看到 `cilium` 和 `cilium-operator` 两个组件都处于 `Running` 状态。
```text
NAMESPACE     NAME                               READY   STATUS    RESTARTS   AGE
kube-system   cilium-operator-6df6cdb59b-mhfwr   1/1     Running   0          26m
kube-system   cilium-v9h96                       1/1     Running   0          26m
```

至此，主节点初始化完成。

## 其他节点 {#other-nodes}
其他节点直接运行主节点初始化完成后给出的 join 命令即可加入集群。
```bash
kubeadm join 192.168.1.130:6443 --token ice2m2.jdrgj8dbj5ijav76 \
        --discovery-token-ca-cert-hash sha256:1822cc0392e40fe7f1166fb87bef33c4224515d0ba428d995b915f48557f95f5 
```
由于从节点没有进行`kubectl` 配置，所以无法使用 `kubectl` 命令查看集群状态。

可以通过主节点查看`node`状态：
```bash
kubectl get nodes
```
`node1`我之前就加入集群了，所以 `node1` 节点处于 `Ready` 状态。
这里可以看到 `master` `node1` 两个节点都处于 `Ready` 状态，`node2` 节点处于 `NotReady` 状态，表示还没有加入集群。
```text
NAME     STATUS     ROLES           AGE     VERSION
master   Ready      control-plane   42m     v1.30.2
node1    Ready      <none>          9m55s   v1.30.2
node2    NotReady   <none>          4s      v1.30.2
```
这是因为`node2`上还没有完成接入，等待片刻后再次查看 `node` 状态：
```text
NAME     STATUS   ROLES           AGE   VERSION
master   Ready    control-plane   44m   v1.30.2
node1    Ready    <none>          11m   v1.30.2
node2    Ready    <none>          79s   v1.30.2
```
`node2`节点已经加入集群，`Ready` 状态。

至此，集群初始化完成。
