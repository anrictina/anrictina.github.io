# K8s集群中使用Gateway

> 先附带官方文档说明 [GatewayAPI](https://gateway-api.sigs.k8s.io/) | [cilium GatewayAPI](https://docs.cilium.io/en/latest/network/servicemesh/gateway-api/gateway-api/)

## 根据自己的环境安装相应的 GatewayAPI CRD
我的环境使用的cilium，我这里就安装了 cilium 提供的CRD，但是这个属于测试版本，这里仅供参考即可
```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
```
cilium安装还需要单独加装tls的CRD支持
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/gateway-api/v1.2.0/config/crd/experimental/gateway.networking.k8s.io_tlsroutes.yaml
```

cilium安装时需指定参数
```bash
cilium install --set kubeProxyReplacement=true \
    --set gatewayAPI.enabled=true
```

完成后通过kubectl检查
```bash
# 检查命令
kubectl get gatewayclasses.gateway.networking.k8s.io 
# 输出如下内容
NAME     CONTROLLER                     ACCEPTED   AGE
cilium   io.cilium/gateway-controller   True       3d21h
```

## 创建并使用Gateway
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: nacos-web
spec:
  gatewayClassName: cilium # 这里指明使用上面创建的 gatewayclass
  listeners:    # 这里指明监听信息，使用 HTTP 协议监听 80 端口
  - name: http
    protocol: HTTP
    port: 80
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: nacos-httproute
spec:
  parentRefs:
  - name: nacos-web # 这里指明路由所属的 Gateway
  rules:
  - matches: # 这里指明路由规则
    - path:
        type: PathPrefix
        value: /
    backendRefs: # 这里指明路由的后端服务
    - name: nacos-headless # 这里指明后端服务（service）的名称
      port: 8848
```