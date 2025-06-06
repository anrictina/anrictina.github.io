# Docker 安装常见应用

## 安装mysql
```bash
docker pull mysql:8.0

docker run -p 3309:3306 --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:8.0
```

## 安装redis
```bash
docker pull hub.atomgit.com/amd64/redis:7.0.13

通过redis官网下载对应版本压缩包，解压后获取相应的redis.conf配置
如需密码验证，可修改 requirepass 选项

docker run -d -p 6389:6379 -v /home/redis_conf/:/home/ --name redis7 redis:7.0 redis-server /home/redis.conf
```