# Linux搭建 Granfa+Prometheus 主机监控服务

::: tip 提示
本文环境如下：
1. 操作系统： Ubuntu Server 22.04
2. docker version: 27.5.1

## 依次下载以下工具包
[Prometheus](https://objects.githubusercontent.com/github-production-release-asset-2e65be/6838921/ea79bd2f-216d-454e-8d68-b9093ea1bb3a?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20250221%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250221T021002Z&X-Amz-Expires=300&X-Amz-Signature=467c6133864ccc4f55b60ccaebf7d678b6545cd6ba43cef8b02ad6fcb5329f83&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dprometheus-3.2.0.linux-amd64.tar.gz&response-content-type=application%2Foctet-stream)
Prometheus安装包
[node_exporter](https://objects.githubusercontent.com/github-production-release-asset-2e65be/9524057/c181ae2d-a1b3-4bac-883f-2a071c7ba341?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20250221%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250221T060235Z&X-Amz-Expires=300&X-Amz-Signature=259453d9b3c6415b8d121ee577b083a9c7597142c72ef2b9120f2e4a994cddcc&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3Dnode_exporter-1.9.0.linux-amd64.tar.gz&response-content-type=application%2Foctet-stream)
主机端点监控服务

## 安装 Prometheus
1. 解压
```shell
tar zxvf prometheus-3.2.0.linux-amd64.tar.gz
cd prometheus-3.2.0.linux-amd64
```
2. 修改配置
```yaml [prometheus.yml]
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:9090"]
  - job_name: "Linux"
    file_sd_configs:
      - files:
          - '/opt/prometheus-3.2.0.linux-amd64/config/*.yaml' # /opt/prometheus-3.2.0.linux-amd64/config 此处是我的动态配置发现文件的目录，可根据自身需求变更
```
3. 创建 Prometheus 系统服务
```shell 
cat <<EOF > /lib/systemd/system/prometheus.service
[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/introduction/overview/
After=network.target

[Service]
ExecStart=/opt/prometheus-3.2.0.linux-amd64/prometheus \
  --config.file=/opt/prometheus-3.2.0.linux-amd64/prometheus.yml \
  --web.enable-lifecycle
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=3
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 重新加载服务
sudo systemctl daemon-reload
# 启动 Prometheus
sudo systemctl enable --now prometheus
```

## 安装监控工具 node_exporter (此步骤在需要监控的主机上操作)
1. 解压
```shell
tar zxvf node_exporter-1.9.0.linux-amd64.tar.gz
cd node_exporter-1.9.0.linux-amd64
```
2. 创建 node_exporter 系统服务
```shell
cat <<EOF > /lib/systemd/system/node-exporter.service
[Unit]
Description=Node Exporter
Documentation=https://prometheus.io/docs/introduction/overview/
After=network.target

[Service]
ExecStart=/opt/node_exporter-1.9.0.linux-amd64/node_exporter \
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=3
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# 重新加载服务
sudo systemctl daemon-reload
# 启动 node-exporter
sudo systemctl enable --now node-exporter
```

## 修改 Prometheus 配置
1. 找到一开始 prometheus.yaml 中写入的 文件服务发现 配置目录
```text
/opt/prometheus-3.2.0.linux-amd64/config/
```
2. 写入需要监控的主机
```yaml
- targets: ['192.168.1.71:9100']
  labels: # 可自定义需要的标签，方便后续检索使用
    server-name: qgzz71
```
