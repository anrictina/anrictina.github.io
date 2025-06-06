# Debian12安装后新增阿里apt源 #{Debian12_install_add_aliyun_apt_source}

Debian12安装时默认情况是不使用网络镜像源的，也不建议在安装时指定网络镜像源

之前有一次在使用安装时指定了网络镜像源，但是后面安装时花费太长时间，最后直接停止安装后重新安装

推荐是在系统安装完成后，手动添加apt源，速度会快很多。

## 初次安装后
初次安装完成后，系统默认无网络镜像源，此时执行 `apt update` 会出现如下错误：

![apt update 错误](/devops/linux/debian12-install-apt-source-error.png)


## apt源文件

::: tip 提示
以下`source.list`文件仅适用于Debian12，其它版本的Debian请自行修改

如有其他镜像源需求，请参考[Debian官方文档](https://www.debian.org/mirror/list)
:::

::: details source.list
```list 
#deb cdrom:[Debian GNU/Linux 12.4.0 _Bookworm_ - Official amd64 DVD Binary-1 with firmware 20231210-17:57]/ bookworm main non-free-firmware
deb https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main
deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free non-free-firmware contrib
deb https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
deb-src https://mirrors.aliyun.com/debian/ bookworm-backports main non-free non-free-firmware contrib
```
:::

## 手动添加apt源文件

将 source.list 文件内容复制到 /etc/apt/sources.list.d/ 目录下

此时再次执行 `apt update` 即可正常更新apt源

![apt update](/devops/linux/debian12-add-source_list.png)

## 去除异常

如果不想看到上图中的错误提示，可将 /etc/apt/sources.list 文件中的内容注释即可

再次执行 `apt update` 即可正常更新apt源

![apt update 去除错误提示](/devops/linux/debian12-apt-sources_list.png)



