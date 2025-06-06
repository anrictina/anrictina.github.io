# 安装Cilium-GatewayClass

1. 访问 [cilium gateway支持](https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/)，获取gateway相关的CRD并进行安装
2. 注意：如果你已经安装了cilium，需要卸载后重新安装，并在安装时携带如下参数
   ```--set kubeProxyReplacement=true --set gatewayAPI.enabled=true ```
   
## 使用GatewayAPI
1. 获取本地的GatewayClass
```sh
root@qgzz77:/opt/argocd# k get gatewayclasses.gateway.networking.k8s.io 
NAME     CONTROLLER                     ACCEPTED   AGE
cilium   io.cilium/gateway-controller   True       13m
```
2. 创建 gateway (我这里使用已经搭建的Nacos服务来举例)
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: nacos-web
spec:
  gatewayClassName: cilium
  listeners:
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
  - name: nacos-web
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /nacos
    backendRefs:
    - name: nacos-headless
      port: 8848
```

