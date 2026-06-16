---
title: 搭建Kafka
published: 2024-07-10 15:42
category: 工具
draft: false
tags: [Kafka, Zookeeper, 消息队列]
---

## 0x01 Zookeeper集群搭建

### 1、目标

Kafka集群依赖于Zookeeper进行协调，搭建Kafka之前需要搭建Zookeeper，在两台服务器上搭建Zookeeper集群

### 2、准备

准备两台服务器

```bash
# kafka_1
10.1.239.144

# kafka_2
10.1.239.146
```

### 3、步骤

```bash
# 下载：https://zookeeper.apache.org/releases.html
https://www.apache.org/dyn/closer.lua/zookeeper/zookeeper-3.8.4/apache-zookeeper-3.8.4-bin.tar.gz

# 上传：上传至/opt目录

# 解压：将Zookeeper解压至/usr/local目录
tar -zxvf /opt/apache-zookeeper-3.8.4-bin.tar.gz -C /usr/local

# 创建目录
/usr/local/apache-zookeeper-3.8.4-bin根目录下创建datas和logs文件夹
mkdir /usr/local/apache-zookeeper-3.8.4-bin/{datas,logs}
```

```bash
# 重命名
mv /usr/local/apache-zookeeper-3.8.4-bin/conf/zoo_sample.cfg /usr/local/apache-zookeeper-3.8.4-bin/conf/zoo.cfg

# 修改配置
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
dataDir=/usr/local/apache-zookeeper-3.8.4-bin/datas
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# https://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1

## Metrics Providers
#
# https://prometheus.io Metrics Exporter
#metricsProvider.className=org.apache.zookeeper.metrics.prometheus.PrometheusMetricsProvider
#metricsProvider.httpHost=0.0.0.0
#metricsProvider.httpPort=7000
#metricsProvider.exportJvmInfo=true
server.1=10.1.239.144:2888:3888
server.2=10.1.239.146:2888:3888

```

```bash
# 节点拷贝
scp -r /usr/local/apache-zookeeper-3.8.4-bin root@10.1.239.146:/usr/local/apache-zookeeper-3.8.4-bin
```

```bash
# 创建myid
每个Zookeeper节点dataDir指定目录中都需要创建一个名为myid的文件，其内容为上述配置文件中的server.X的X值，例如X是144，那么/usr/local/apache-zookeeper-3.8.4-bin/datas/myid文件的值为100，执行如下指令：

10.1.239.144节点：
tee /usr/local/apache-zookeeper-3.8.4-bin/datas/myid <<- 'EOF'
1
EOF

10.1.239.146节点：
tee /usr/local/apache-zookeeper-3.8.4-bin/datas/myid <<- 'EOF'
2
EOF
```

```bash
# 开放端口
firewall-cmd --zone=public --add-port=2181/tcp --add-port=2888/tcp --add-port=3888/tcp --add-port=7000/tcp --permanent
firewall-cmd --reload
```

PS：每个Zookeeper所在节点都需要通过执行上面命令开放端口

### 4、启动节点

```bash
# 每个Zookeeper所在节点都需要通过执行下面命令启动节点
/usr/local/apache-zookeeper-3.8.4-bin/bin/zkServer.sh start
/usr/local/apache-zookeeper-3.8.4-bin/bin/zkServer.sh status
/usr/local/apache-zookeeper-3.8.4-bin/bin/zkServer.sh stop
```

### 5、访问节点

```bash
/usr/local/apache-zookeeper-3.8.4-bin/bin/zkCli.sh -server 10.1.239.144:2181
```

## 0x02 Kafka集群搭建

### 1、目标

注册在同一个Zookeeper集群中的各个Kafka节点属于同一个Kafka集群，Kafka通过brokerId来区分集群中的不同节点，在两台服务器上搭建Kafka集群

### 2、准备

```bash
# kafka_1
10.1.239.144

# kafka_2
10.1.239.146
```

### 3、步骤

```bash
# 下载：https://downloads.apache.org/kafka/3.7.0/
https://downloads.apache.org/kafka/3.7.0/kafka_2.12-3.7.0.tgz

# 上传：上传至/opt目录

# 解压：将Kafka解压至/usr/local目录
tar -zxvf /opt/kafka_2.12-3.7.0.tgz -C /usr/local

# 创建目录
/usr/local/kafka_2.12-3.7.0根目录下创建logs文件夹
mkdir /usr/local/kafka_2.12-3.7.0/logs
```

```bash
# 节点拷贝
scp -r /usr/local/kafka_2.12-3.7.0 root@10.1.239.146:/usr/local/kafka_2.12-3.7.0
```

```bash
# 修改配置
vim /usr/local/kafka_2.12-3.7.0/config/server.properties
# 同一Kafka集群下broker.id必须不同

# 10.1.239.144
broker.id=1
advertised.listeners=PLAINTEXT://10.1.239.144:9092
log.dirs=/usr/local/kafka_2.12-3.7.0/logs
zookeeper.connect=10.1.239.144:2181,10.1.239.146:2181

# 10.1.239.146
broker.id=2
advertised.listeners=PLAINTEXT://10.1.239.146:9092
log.dirs=/usr/local/kafka_2.12-3.7.0/logs
zookeeper.connect=10.1.239.144:2181,10.1.239.146:2181
```

```bash
# 环境变量
tee -a /etc/profile <<- 'EOF'
export KAFKA_HOME=/usr/local/kafka_2.12-3.7.0
export PATH=$PATH:$KAFKA_HOME/bin
EOF

source /etc/profile
```

```bash
# 开放端口，针对Zookeeper
firewall-cmd --zone=public --add-port=2181/tcp --permanent
firewall-cmd --reload
```

### 4、启动Kafka

```bash
# 启动Zookeeper
# 每个Zookeeper所在节点都需要通过执行下面命令启动节点
/usr/local/apache-zookeeper-3.8.4-bin/bin/zkServer.sh start
# 启动Kafka
kafka-server-start.sh $KAFKA_HOME/config/server.properties
```

## 常用命令

```bash
# 查看topics
kafka-topics.sh --zookeeper 10.1.239.144:2181 --list              # 旧版本
./kafka-topics.sh --bootstrap-server 11.223.35.63:9092 --list       # 新版本

11.223.35.63:9092
system_info_receipt

# 查看topics内容
kafka-console-consumer.sh --bootstrap-server 10.1.239.144:9092 --topic my_topic --from-beginning
./kafka-console-consumer.sh --bootstrap-server 11.223.35.57:9092 --topic system_info_receipt --from-beginning
./kafka-console-consumer.sh --bootstrap-server 11.223.35.63:9092 --topic st-security-capacity --from-beginning


# 删除topics
kafka-topics.sh --delete --topic my_topic --bootstrap-server 10.1.239.144:9092

kafka-2.0.2
pip3 install kafka-python -i https://mirrors.aliyun.com/pypi/simple/


0 16 * * * /usr/bin/python3 /root/kafka_upload/class.py

```

