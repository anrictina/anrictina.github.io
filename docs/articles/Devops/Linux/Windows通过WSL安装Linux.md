# Windows通过WSL安装Ubuntu

> 先附带上说明网站
> 
>  [WSL安装说明](https://learn.microsoft.com/zh-cn/windows/wsl/install)
> 
>  [Ubuntu(WSL)下载](https://ubuntu.com/desktop/wsl)
> 
>  [WSL导入说明](https://learn.microsoft.com/zh-cn/windows/wsl/use-custom-distro)

1. 通过Ubuntu官方地址下载Ubuntu的WSL版本压缩包
   1. 本文通过以下地址下载压缩包 [Ubuntu WSL下载](https://releases.ubuntu.com/noble/ubuntu-24.04.2-wsl-amd64.wsl?_gl=1*17p00nq*_gcl_au*ODg5NjM5NTY0LjE3NDM2NzEzMzk.)
   2. 压缩文件：ubuntu-24.04.2-wsl-amd64.gz
2. 创建挂载系统需要的目录
   1. 创建目录：E:\WSL2\rust
3. 执行WSL导入操作(注意上下文路径，我这里是在压缩包所在目录执行)
   ```cmd 
   wsl --import Rust E:\WSL2\rust\ .\ubuntu-24.04.2-wsl-amd64.gz
    ```
4. 链接并验证
   ```cmd
    F:\工具\ISO>wsl --list
    适用于 Linux 的 Windows 子系统分发:
    Ubuntu24 (默认)
    Develop
    Rust # 可以看到已经导入了
   ```
   通过 `wsl -d Rust` 启动对应的linux容器
   ```cmd
    F:\工具\ISO>wsl -d Rust
    Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 5.15.167.4-microsoft-standard-WSL2 x86_64)

    * Documentation:  https://help.ubuntu.com
    * Management:     https://landscape.canonical.com
    * Support:        https://ubuntu.com/pro

    System information as of Mon Apr 28 11:37:17 CST 2025

    System load:  0.25                Processes:             36
    Usage of /:   0.1% of 1006.85GB   Users logged in:       0
    Memory usage: 15%                 IPv4 address for eth0: 172.28.192.172
    Swap usage:   0%

    This message is shown once a day. To disable it please create the
    /root/.hushlogin file.
    root@DESKTOP-JT2DV3R:/mnt/f/工具/ISO#
   ```
5. 关闭并停止容器
   
   通过 `wsl -t Rust` 终止 Rust 容器
   ```cmd
    F:\工具\ISO>wsl -t Rust
    操作成功完成。

    F:\工具\ISO>wsl --list --running
    适用于 Linux 的 Windows 子系统分发:
    Develop
   ```