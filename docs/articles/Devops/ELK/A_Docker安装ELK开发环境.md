# Docker安装ELK开发环境

::: tip 提示
本文环境如下：
1. Ubuntu：22.04
2. Docker: 28.0.1
3. Docker Compose: v2.33.1
:::

## 创建Elasticsearch服务
先对挂载目录做授权
```shell
chmod 777 /data/elasticsearch/data
```
## 创建 elasticsearch 配置文件
具体配置可自行参考官方，我这里仅用于本地测试使用
```shell
tee elasticsearch.yml <<EOF
cluster.name: "docker-cluster"
network.host: 0.0.0.0
# 开启x-pack插件,用于添加账号密码、安全控制等配置
xpack.security.enabled: true 
xpack.security.transport.ssl.enabled: false
xpack.security.enrollment.enabled: false
EOF
```
执行以下命令创建elasticsearch的docker compose文件
```shell 创建 docker-elasticsearch.yaml
tee docker-elasticsearch.yaml <<EOF
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.17.3
    container_name: elasticsearch
    environment:
      - discovery.type=single-node  # 单节点模式
      - ES_JAVA_OPTS=-Xms1024m -Xmx1024m
      - ELASTIC_PASSWORD=<password>  # 注意这里是要设置的密码
    volumes:
      - /data/elasticsearch/data:/usr/share/elasticsearch/data
      - /path/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
    ports:
      - "9200:9200"
      - "9300:9300"
    healthcheck:
      test: ["CMD","curl","-f","-u","elastic:<password>","http://localhost:9200"] # 这里使用上面设置的密码验证服务是否已启动
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 90s
      start_interval: 5s
    networks:
      - elk
networks:
  elk:
    driver: bridge
EOF
```
启动 elasticsearch
```shell
docker compose -f docker-elasticsearch.yaml
```
初始化各组件密码
```shell
# 注意替换你需要的密码，后续会使用
curl -u elastic:<password> -X POST "localhost:9200/_security/user/kibana_system/_password" -H 'Content-Type: application/json' -d '{"password" : "<new-password>"}'
curl -u elastic:<password> -X POST "localhost:9200/_security/user/logstash_system/_password" -H 'Content-Type: application/json' -d '{"password" : "<new-password>"}'
```


## 创建 logstash 和 kibana 的docker compose文件
```shell
tee logstash-kibana.yaml <<EOF
services:
  logstash:
    image: docker.elastic.co/logstash/logstash:8.17.3
    container_name: logstash
    environment:
      - XPACK_MONITORING_ELASTICSEARCH_PASSWORD=<new-password>
    depends_on:
      elasticsearch: 
        condition: service_healthy
    command: >
      logstash -e '
        input {
          tcp {
            port => 5000
            codec => json
          }
        }
        output {
          elasticsearch {
            hosts => ["http://elasticsearch:9200"]
            user => "elastic"
            password => "<new-password>"
            index => "logs-%{+YYYY.MM.dd}"
          }
          stdout { codec => rubydebug }  # 输出到控制台方便调试
        }
      '
    ports:
      - "5000:5000"
    networks:
      - elk

  kibana:
    image: docker.elastic.co/kibana/kibana:8.17.3
    container_name: kibana
    depends_on:
      elasticsearch:
        condition: service_healthy
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200  # 使用HTTP协议
      - I18N_LOCALE=zh-CN
      - ELASTICSEARCH_USERNAME=kibana_system
      - ELASTICSEARCH_PASSWORD=<new-password>
    ports:
      - "5601:5601"
    networks:
      - elk

networks:
  elk:
    driver: bridge
EOF
```