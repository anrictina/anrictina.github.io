# 创建私有镜像仓库服务

> 本文使用 Harbor 作为镜像仓库组件
> 使用docker快速安装
> [Harbor官方文档](https://goharbor.io/docs/2.12.0/install-config/download-installer/)

## 下载Harbor
[Harbor版本地址](https://github.com/goharbor/harbor/releases)
先从上述地址下载harbor的安装压缩包
`harbor-offline-installer-version.tgz`离线安装包
`harbor-online-installer-version.tgz`在线安装包
推荐使用离线包，可以挂代理

## 配置Harbor
1. 解压
```shell
tar zxvf harbor-offline-install-version.tgz
```
2. 配置https访问
- 生成 CA 证书私有密钥
```shell
openssl genrsa -out ca.key 4096
```
- 生成 CA 证书（这里证书有效期 10 年）
```
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=MyPersonal Root CA" \
 -key ca.key \
 -out ca.crt
```
- 生成服务器证书密钥 ( youdomain.com 指的是你的域名)
```
openssl genrsa -out <youdomain.com>.key 4096
```
- 生成证书签名请求
```
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=example/OU=Personal/CN=yourdomain.com" \
    -key yourdomain.com.key \
    -out yourdomain.com.csr
```
- 生成 x509 v3 扩展文件
```
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=yourdomain.com
DNS.2=yourdomain
DNS.3=hostname
EOF
```
- 使用扩展文件创建证书
```
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in yourdomain.com.csr \
    -out yourdomain.com.crt
```
- 最后得到下述几个需要的文件
```shell
ca.crt ## ca证书
yourdomain.com.crt ## 域名证书
yourdomain.com.key ## 域名证书密钥
```
3. 向Harbor和Docker提供证书
- 创建 Harbor 相关配置目录
```shell
mkdir /etc/harbor
```
- 将创建的域名证书和域名证书密钥复制到配置目录
```shell
cp yourdomain.com.crt /etc/harbor/
cp yourdomain.com.key /etc/harbor/
```
- 创建docker需要的证书文件
```shell
openssl x509 -inform PEM -in yourdomain.com.crt -out yourdomain.com.cert
```
- 将证书密钥和ca证书全部放入docker的证书配置目录(`/etc/docker/certs.d/yourdomain.com/`)
```shell
cp yourdomain.com.cert /etc/docker/certs.d/yourdomain.com/
cp yourdomain.com.key /etc/docker/certs.d/yourdomain.com/
cp ca.crt /etc/docker/certs.d/yourdomain.com/
```
- 重启docker
```shell
systemctl restart docker
```
4. 配置 Harbor YML文件
- 进入之前解压的harbor目录，复制harbor.yml.tmpl文件
```shell
cp harbor.yml.tmpl harbor.yml
```
- 修改 harbor.yml
```yaml
# 这里注意，需要把域名改为和申请证书的一致
hostname: yourdomain.com

# 这里可以直接用前面放入docker的证书文件
https:
  certufucate: /etc/docker/certs.d/yourdomain.com/yourdomain.cert
  private_key: /etc/docker/certs.d/yourdomain.com/yourdomain.key

# 这里写你的admin登录秘密
harbor_admin_password: <password>

# 代理配置
# harbor可以添加代理去访问docker-hub和google的仓库，但你要先部署一个代理服务
proxy:
  http_proxy: http://192.168.1.58:20171
  https_proxy: http://192.168.1.58:20171
  no_proxy: localhost,core.harbor.domain,127.0.0.1
```

5. 开始安装
```shell
sudo ./install.sh
```
安装完成后即可通过域名访问harbor仓库（前提你要做好dns解析）

## containerd v2配置证书
1. 创建证书存放目录
```shell
mkdir /etc/containerd/certs.d/yourdomain.com
```
将之前创建的 `ca.crt` `yourdomain.cert` `yourdomain.key` 复制到该目录下
创建 证书和密钥的 pem 文件
```shell
cat yourdomain.cert yourdomain.key > yourdomain.pem
```
2. 创建 hosts.toml 配置文件
containerd通过读取`hosts.toml`文件进行证书加载
```toml [hosts.toml]
server = "https://yourdomain.com"
[host."https://yourdomain.com"]
  capabilities = ["pull","resolve","push"]
  ca = "/etc/containerd/certs.d/yourdomain.com/ca.crt"
  client = ["/etc/containerd/certs.d/yourdomain.com/yourdomain.com.pem"]
```
2. 修改containerd配置文件
```toml [/etc/containerd/config.toml]
    [plugins.'io.containerd.cri.v1.images'.registry]
      config_path = '/etc/containerd/certs.d'
```
3. 验证
> 注意，我这里的 /proxy 是我通过harbor代理的docker-hub仓库
> 另：ctr命令本身好像不会去读取 /etc/containerd/certs.d/目录下的证书配置，需要手动指定，但是 crictl和k8s可以
```shell
ctr i pull --hosts-dir "/etc/containerd/certs.d/" yourdomain.com/proxy/nginx:latest
```
