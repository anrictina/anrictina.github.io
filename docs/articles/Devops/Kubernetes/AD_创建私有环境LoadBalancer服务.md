# 创建私有环境LoadBalancer服务

::: tip 提示
本文环境如下：

1. 私有化K8s集群
2. 已启用 cilium 的 [bgpControlPlane](https://docs.cilium.io/en/stable/network/bgp-control-plane/bgp-control-plane/#prerequisites) (bgp控制平面)
3. 支持 bgp 路由协议的路由器 (我本地使用的是 mikrotik路由器)
:::

## 本地网络环境
- mikrotik路由器 (192.168.1.1,子网：192.168.1.0/24)
  - 办公区路由器  (192.168.1.*,子网：192.168.16.0/24)
    - 我的电脑 (192.168.16.19)
  - k8s节点 (192.168.1.60-192.168.1.65)

## 检查cilium的 bgp控制平面 是否启用
```shell
cilium config view | grep -i bgp
```
输出如下结果说明已启用：
![cilium-bgpControlPlane](/devops/k8s/cilium-bgpControlPlane.png)
如果是 false 则启用：
```shell
cilium config set enable-bgp-control-plane=true
```
如果没有 `enable-bgp-control-plane` 说明cilium没有安装 bgp控制平面，按以下命令重新安装即可（注意你的 cilium 版本）：
> 新增两项参数，便于后续使用cilium的 gateway
```shell
cilium install --version 1.16.5 --set bgpControlPlane.enabled=true --set kubeProxyReplacement=true --set gatewayAPI.enabled=true
```

## 设置 cilium 在集群中的 bgp 配置
[cilium的bgp配置文档](https://docs.cilium.io/en/stable/network/bgp-control-plane/bgp-control-plane-v2/#bgp-control-plane-v2)
::: code-group
```yaml[lb-ippool.yaml]
apiVersion: "cilium.io/v2alpha1"
kind: CiliumLoadBalancerIPPool
metadata:
  name: "lb-pool"
spec:
  blocks:
  - cidr: "20.0.10.0/24" # 由 cilium 给 service(loadbalancer类型) 分配的IP池
```

```yaml[advertisement.yaml]
apiVersion: cilium.io/v2alpha1
kind: CiliumBGPAdvertisement
metadata:
  name: bgp-advertisements
  labels:
    advertise: bgp
spec:
  advertisements:
    - advertisementType: "Service"
      service:
        addresses:
          - LoadBalancerIP
      selector:
        matchExpressions:
          - {key: somekey, operator: NotIn, values: ['never-used-value']}
```
```yaml[peerconfig.yaml]
apiVersion: cilium.io/v2alpha1
kind: CiliumBGPPeerConfig
metadata:
  name: cilium-peer
spec:
  gracefulRestart:
    enabled: true
    restartTimeSeconds: 120
  families:
    - afi: ipv4
      safi: unicast
      advertisements:
        matchLabels:
          advertise: "bgp"
```
```yaml[clusterconfig.yaml]
apiVersion: cilium.io/v2alpha1
kind: CiliumBGPClusterConfig
metadata:
  name: cilium-bgp
spec:
  nodeSelector:
    matchLabels:
      bgp-policy: a # 注意，这里带有指定 label 的主机才会存在
  bgpInstances:
    - name: "instance-64521"
      localASN: 64521
      peers:
        - name: "peer-64520"
          peerASN: 64520
          peerAddress: "192.168.1.1" # 这是我mikrotik路由器的ip地址
          peerConfigRef:
            name: "cilium-peer"
```
:::

## 配置 mikrotik 路由器 bgp协议
打开路由器 terminal 命令端口,输入如下：
```shell
# 注意,如果使用ebgp时请区分 AS
# add address-families=ip as=64520 disabled=no local.role=ebgp name=PEER_TO_K3S_WN_1 output.default-originate=always remote.address=192.168.1.77 routing-table=main 
add address-families=ip as=64520 disabled=no local.role=ibgp name=PEER_TO_K3S_WN_1 output.default-originate=always remote.address=192.168.1.60 routing-table=main
add address-families=ip as=64520 disabled=no local.role=ibgp name=PEER_TO_K3S_WN_2 output.default-originate=always remote.address=192.168.1.61 routing-table=main
add address-families=ip as=64520 disabled=no local.role=ibgp name=PEER_TO_K3S_WN_3 output.default-originate=always remote.address=192.168.1.62 routing-table=main
```
我这里有6台虚拟机节点，注意区分ip和name

## 验证
cilium验证
```shell
cilium bgp peers
```
显示如下
![cilium-bgp-peers](/devops/k8s/cilium-bgp-peers.png)

mikrotik验证
1. 查看已创建的连接
```shell
[admin@Mikrotik] > /routing/bgp/connection/print
Flags: D - dynamic, X - disabled, I - inactive 
 0   name="PEER_TO_K3S_WN_1" 
     remote.address=192.168.1.60/32 
     local.default-address=192.168.1.1 .role=ibgp 
     routing-table=main as=64520 address-families=ip 
     output.default-originate=always 

 1   name="PEER_TO_K3S_WN_2" 
     remote.address=192.168.1.61/32 
     local.default-address=192.168.1.1 .role=ibgp 
     routing-table=main as=64520 address-families=ip 
     output.default-originate=always 

 2   name="PEER_TO_K3S_WN_3" 
     remote.address=192.168.1.62/32 
     local.default-address=192.168.1.1 .role=ibgp 
     routing-table=main as=64520 address-families=ip 
     output.default-originate=always 

 3   name="PEER_TO_K3S_WN_4" 
     remote.address=192.168.1.63/32 
     local.default-address=192.168.1.1 .role=ibgp 
     routing-table=main as=64520 address-families=ip 
     output.default-originate=always 
```

2. 查看bgp会话信息
> 这里的数字后面带有 E 表示已建立连接
```shell
[admin@MikroTik] > routing/bgp/session/print 
Flags: E - established 
 0 E name="PEER_TO_K3S_WN_1-1" 
     remote.address=192.168.1.62 .as=64520 .id=192.168.1.62 .capabilities=mp,rr,enhe,gr,as4,fqdn .afi=ip .hold-time=1m30s .messages=1875 .bytes=35767 .gr-time=120 .gr-afi=ip .gr-afi-fwp=ip .eor=ip 
     local.role=ibgp .address=192.168.1.1 .as=64520 .id=192.168.10.1 .capabilities=mp,rr,gr,as4 .afi=ip .messages=1868 .bytes=35519 .eor="" 
     output.procid=21 .default-originate=always 
     input.procid=21 .last-notification=ffffffffffffffffffffffffffffffff0015030603 ibgp 
     multihop=yes hold-time=1m30s keepalive-time=30s uptime=15h33m12s90ms last-started=2024-12-18 17:21:42 last-stopped=2024-12-18 17:10:46 prefix-count=1 

 1 E name="PEER_TO_K3S_WN_1-2" 
     remote.address=192.168.1.63 .as=64520 .id=192.168.1.63 .capabilities=mp,rr,enhe,gr,as4,fqdn .afi=ip .hold-time=1m30s .messages=1874 .bytes=35748 .gr-time=120 .gr-afi=ip .gr-afi-fwp=ip .eor=ip 
     local.role=ibgp .address=192.168.1.1 .as=64520 .id=192.168.10.1 .capabilities=mp,rr,gr,as4 .afi=ip .messages=1867 .bytes=35500 .eor="" 
     output.procid=23 .default-originate=always 
     input.procid=23 .last-notification=ffffffffffffffffffffffffffffffff0015030603 ibgp 
     multihop=yes hold-time=1m30s keepalive-time=30s uptime=15h32m47s100ms last-started=2024-12-18 17:22:07 last-stopped=2024-12-18 17:10:46 prefix-count=1 

 2 E name="PEER_TO_K3S_WN_1-3" 
     remote.address=192.168.1.64 .as=64520 .id=192.168.1.64 .capabilities=mp,rr,enhe,gr,as4,fqdn .afi=ip .hold-time=1m30s .messages=1874 .bytes=35748 .gr-time=120 .gr-afi=ip .gr-afi-fwp=ip .eor=ip 
     local.role=ibgp .address=192.168.1.1 .as=64520 .id=192.168.10.1 .capabilities=mp,rr,gr,as4 .afi=ip .messages=1867 .bytes=35500 .eor="" 
     output.procid=24 .default-originate=always 
     input.procid=24 .last-notification=ffffffffffffffffffffffffffffffff0015030603 ibgp 
     multihop=yes hold-time=1m30s keepalive-time=30s uptime=15h32m44s100ms last-started=2024-12-18 17:22:10 last-stopped=2024-12-18 17:10:46 prefix-count=1 
```
3. 查看路由状态
```shell
[admin@MikroTik] > routing/route/print 
Flags: A - ACTIVE; c - CONNECT, s - STATIC, b - BGP; H - HW-OFFLOADED
Columns: DST-ADDRESS, GATEWAY, AFI, DISTANCE, SCOPE, TARGET-SCOPE, IMMEDIATE-GW
    DST-ADDRESS        GATEWAY         AFI   DISTANCE  SCOPE  TARGET-SCOPE  IMMEDIATE-GW        
 b  20.0.10.0/32       192.168.1.63    ip4        200     40            30  192.168.1.63%lan-r  
 b  20.0.10.0/32       192.168.1.65    ip4        200     40            30  192.168.1.65%lan-r  
Ab  20.0.10.0/32       192.168.1.60    ip4        200     40            30  192.168.1.60%lan-r  
 b  20.0.10.0/32       192.168.1.61    ip4        200     40            30  192.168.1.61%lan-r  
 b  20.0.10.0/32       192.168.1.64    ip4        200     40            30  192.168.1.64%lan-r  
 b  20.0.10.0/32       192.168.1.62    ip4        200     40            30  192.168.1.62%lan-r                                            
```

## 服务验证
创建nginx服务并使用loadbalancer分配IP
```yaml [hello.yaml]
apiVersion: v1
kind: Pod
metadata:
  name: simple-pod
  labels:
    app: simple-pod
spec:
  containers:
  - name: my-app-container
    image: nginx:latest
    ports:
    - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: simple-pod  # Make sure this matches the label of the Pod
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 80
  type: LoadBalancer
```
部署后查看 service 分配IP
```shell
root@k8s01:/opt/test# kubectl get svc 
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
kubernetes   ClusterIP      10.96.0.1       <none>        443/TCP          12d
my-service   LoadBalancer   10.102.141.29   20.0.10.0     8080:31567/TCP   15h
```
通过办公区电脑跨网段访问
::: code-group
```shell[我的电脑网络信息]
无线局域网适配器 WLAN 3:

   连接特定的 DNS 后缀 . . . . . . . :
   IPv4 地址 . . . . . . . . . . . . : 192.168.16.19
   子网掩码  . . . . . . . . . . . . : 255.255.254.0
   默认网关. . . . . . . . . . . . . : 192.168.16.1
```
```shell [访问 service]
C:\Users\admin>curl 20.0.10.0:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```
:::

## 参考案例
1. cilium旧版bgp配置方案，该版本不适用于新版构建，但该版本很有意义，有助于理解和学习

   [Kubernetes LoadBalance service using Cilium BGP control plane](https://medium.com/@valentin.hristev/kubernetes-loadbalance-service-using-cilium-bgp-control-plane-8a5ad416546a)
2. cilium新版bgp配置方案，基于新版构建
   
    [Local Kubernetes LoadBalancer Service Using Cilium BGP](https://kamrul.dev/kubernetes-loadbalancer-cilium-bgp/)
