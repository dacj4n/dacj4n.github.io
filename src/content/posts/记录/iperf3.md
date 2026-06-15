---
title: Iperf3测速
published: 2025-12-28 14:43
tags: 命令
category: 命令
draft: false
---



# Iperf3测速

iperf3 是一个`TCP`、`UDP`和`SCTP`网络带宽测量工具。是用于主动测量 IP 网络上可达到的最大带宽的工具。它支持调整与时序，协议和缓冲区有关的各种参数。对于每个测试，它都会报告测得的吞吐量`/`比特率，损耗和其他参数。

## 0x00 常用参数

### 1、通用参数

```
-v 查看版本信息
-p 端口号
-f 指定带宽输出格式： Kbits、Mbits、Gbits、Tbits
-i 监控报告时间间隔，单位秒(s)
-J Json格式输出结果
--logfile 将结果输出到指定文件中
```

### 2、服务端参数

```
-s 以服务器模式运行
-D 后台运行服务器模式
```

3、客户端参数

```
-c 以客户端模式运行，连接到服务端

-t 传输时间，默认10秒

-n 传输内容大小，不能与-t同时使用

-b 目标比特率(0表示无限)(UDP默认1Mbit/sec，TCP不受限制)

-l 要读取或写入的缓冲区长度(TCP默认128 KB，UDP默认1460)

-O 忽略前几秒

-R 反向模式运行，即服务端发送，客户端接收

-u 使用UDP协议，默认使用TCP协议

--get-server-output 输出服务端的结果
```

## 0x01 安装

```
# Linux下安装
yum -y install iperf3  # Centos
apt install iperf3     # Ubuntu
```

```
# MAC brew下安装
brew install iperf3
```

```
# Window下载
https://iperf.fr/
```

## 0x02 使用

### 1、服务端

```
# 设置监控时间10s，端口为5201，防火墙端口要放行
iperf3 -s -i 10 -p 5201
```

### 2、客户端

```
# 指定-c测速服务器IPx.x.x.x，-p指定端口为5201，-t测速时间5s，-P指定发送连接数10，-R表示下载测速
iperf3 -c x.x.x.x -p 5201 -t 5 -P 10 -R
```

### 3、举例

1）执行`20s`，每`5s`执行一次

```
iperf3 -c 43.248.136.69 -t 20 -i 5
```

2）传输数据包`5G`，每`7s`显示一次

```
iperf3 -c 43.248.136.69 -i 7 -n 5G
```

3）`-F`指定文件传输

```
iperf3 -c 43.248.136.69 -i 2 -F Python-3.7.1rc2.tgz -t 20
```

