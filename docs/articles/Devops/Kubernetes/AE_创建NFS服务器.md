# 创建NFS服务器

> NFS服务用于稍后创建K8s卷

## 安装
```shell
apt update

sudo apt install nfs-kernel-server -y
```

## 设置服务目录
```shell
mkdir /srv/test/

chown nobody:nogroup /srv/test/

echo "/srv/store 192.168.1.0/24(rw,sync,crossmnt,all_squash,no_subtree_check)" | sudo tee -a /etc/exports

systemctl start nfs-kernel-server
```
- /srv/store 共享的目录
- 192.168.1.0/24 可访问的客户端范围
- rw 读写权限
- sync 同步写入
- fsid=0 文件系统ID，为0表示 NFS 根导出
- crossmnt 自动跨挂载点
- no_subtree_check 不进行子树检查

