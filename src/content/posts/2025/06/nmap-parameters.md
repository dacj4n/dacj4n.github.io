---
title: Nmap参数详解
published: 2025-06-16 11:12
category: 工具
draft: false
tags: [Nmap, 端口扫描, 参数]
---

## 介绍

nmap是一个网络连接端扫描软件，用来扫描网上电脑开放的网络连接端。确定哪些服务运行在哪些连接端，并且推断计算机运行哪个操作系统（这是亦称 fingerprinting）。它是网络管理员必用的软件之一，以及用以评估网络系统安全。
正如大多数被用于网络安全的工具，nmap 也是不少黑客及骇客（又称脚本小子）爱用的工具 。系统管理员可以利用nmap来探测工作环境中未经批准使用的服务器，但是黑客会利用nmap来搜集目标电脑的网络设定，从而计划攻击的方法。

## 参数

```bash
nmap –iflist : 查看本地主机的接口信息和路由信息
-A ：选项用于使用进攻性方式扫描
-T4： 指定扫描过程使用的时序，总有6个级别（0-5），级别越高，扫描速度越快，但也容易被防火墙或IDS检测并屏蔽掉，在网络通讯状况较好的情况下推荐使用T4
-oX test.xml： 将扫描结果生成 test.xml 文件，如果中断，则结果打不开
-oA test.xml:  将扫描结果生成 test.xml 文件，中断后，结果也可保存
-oG test.txt:  将扫描结果生成 test.txt 文件
-sn : 只进行主机发现，不进行端口扫描
-O : 指定Nmap进行系统版本扫描
-sV: 指定让Nmap进行服务版本扫描
-p <port ranges>: 扫描指定的端口
-sS/sT/sA/sW/sM:指定使用 TCP SYN/Connect()/ACK/Window/Maimon scans的方式来对目标主机进行扫描
-sU: 指定使用UDP扫描方式确定目标主机的UDP端口状况
-script <script name> : 指定扫描脚本
-Pn ： 不进行ping扫描
-sP :  用ping扫描判断主机是否存活，只有主机存活，nmap才会继续扫描，一般最好不加，因为有的主机会禁止ping
-PI :  设置这个选项，让nmap使用真正的ping(ICMP echo请求)来扫描目标主机是否正在运行。
-iL 1.txt : 批量扫描1.txt中的目标地址
-sL: List Scan 列表扫描，仅将指定的目标的IP列举出来，不进行主机发现
-sY/sZ: 使用SCTP INIT/COOKIE-ECHO来扫描SCTP协议端口的开放的情况
-sO: 使用IP protocol 扫描确定目标机支持的协议类型
-PO : 使用IP协议包探测对方主机是否开启 
-PE/PP/PM : 使用ICMP echo、 ICMP timestamp、ICMP netmask 请求包发现主机
-PS/PA/PU/PY : 使用TCP SYN/TCP ACK或SCTP INIT/ECHO方式进行发现
-sN/sF/sX: 指定使用TCP Null, FIN, and Xmas scans秘密扫描方式来协助探测对方的TCP端口状态
-e eth0：指定使用eth0网卡进行探测
-f : --mtu <val>: 指定使用分片、指定数据包的 MTU.
-b <FTP relay host>: 使用FTP bounce scan扫描方式
-g： 指定发送的端口号
-r: 不进行端口随机打乱的操作（如无该参数，nmap会将要扫描的端口以随机顺序方式扫描，以让nmap的扫描不易被对方防火墙检测到）
-v 表示显示冗余信息，在扫描过程中显示扫描的细节，从而让用户了解当前的扫描状态
-n : 表示不进行DNS解析；
-D  <decoy1,decoy2[,ME],...>: 用一组 IP 地址掩盖真实地址，其中 ME 填入自己的 IP 地址
-R ：表示总是进行DNS解析。 
-F : 快速模式，仅扫描TOP 100的端口 
-S <IP_Address>: 伪装成其他 IP 地址
--ttl <val>: 设置 time-to-live 时间
--badsum: 使用错误的 checksum 来发送数据包（正常情况下，该类数据包被抛弃，如果收到回复，说明回复来自防火墙或 IDS/IPS）
--dns-servers  : 指定DNS服务器
--system-dns : 指定使用系统的DNS服务器   
--traceroute : 追踪每个路由节点 
--scanflags <flags>: 定制TCP包的flags
--top-ports <number> :扫描开放概率最高的number个端口
--port-ratio <ratio>: 扫描指定频率以上的端口。与上述--top-ports类似，这里以概率作为参数
--version-trace: 显示出详细的版本侦测过程信息
--osscan-limit: 限制Nmap只对确定的主机的进行OS探测（至少需确知该主机分别有一个open和closed的端口）
--osscan-guess: 猜测对方的主机的系统类型。准确性会下降，但会尽可能多为用户提供潜在的操作系统
--data-length <num>: 填充随机数据让数据包长度达到 Num
--ip-options <options>: 使用指定的 IP 选项来发送数据包
--spoof-mac <mac address/prefix/vendor name> : 伪装 MAC 地址
--version-intensity <level>: 指定版本侦测强度（0-9），默认为7。数值越高，探测出的服务越准确，但是运行时间会比较长。
--version-light: 指定使用轻量侦测方式 (intensity 2)
--version-all: 尝试使用所有的probes进行侦测 (intensity 9)
--version-trace: 显示出详细的版本侦测过程信息
nmap 192.168.1.0/24 -exclude 192.168.1.10  #扫描除192.168.1.0外的该网段的其他地址
nmap 192.168.1.0/24 -excludefile f:/1.txt  #扫描除给定文件中的地址以外的其他地址
nmap -sF -T4 192.168.1.0 #探测防火墙状态
```

### -T

```
在nmap中，-T参数是用于指定扫描速度的选项。该参数的值可以是0-5之间的整数，其中0表示不限制扫描速度，而5表示最慢的扫描速度。根据nmap的文档，不同的等级会影响nmap的行为方式，例如：

-T0表示关闭优化，将在每个目标上进行最详细的扫描，但可能会导致目标系统的资源过度消耗。
-T3是默认的扫描速度等级，可以在大多数情况下保证扫描效率和准确性。
-T4表示更快的扫描速度，可以在大多数情况下提高扫描速度和效率，但会增加被探测到的可能性。
-T5表示最慢的扫描速度，将在每个目标上进行最仔细的扫描，以最小化目标系统的资源消耗和减少被探测到的可能性。
因此，在选择扫描速度等级时，需要考虑到目标系统的资源使用情况、扫描的目的和可接受的被探测到的风险等因素。


在nmap中，-T1和-T2是可以使用的扫描速度等级选项。

-T1表示非常慢的扫描速度，会使得扫描更加缓慢，但是可以降低目标系统被探测到的风险和减少探测所占用的网络带宽。该选项在需要极高安全性和隐秘性的情况下使用。

-T2表示相对慢的扫描速度，比-T1略快，但仍然会使扫描变得缓慢，以降低目标系统被探测到的风险和减少探测所占用的网络带宽。该选项在需要较高安全性和隐秘性的情况下使用。

需要注意的是，使用较慢的扫描速度等级会使得扫描变得缓慢，可能会影响扫描的效率和时间，因此需要根据具体情况选择合适的扫描速度等级。
```

## 主机发现

探测主机是否在线
用户可以在不同的条件下灵活选用不同的方式来探测目标机，主机发现常用参数如下

```bash
-sn: Ping Scan 只进行主机发现，不进行端口扫描
-PE/PP/PM: 使用ICMP echo、 ICMP timestamp、ICMP netmask 请求包发现主机
-PS/PA/PU/PY[portlist]: 使用TCP SYN/TCP ACK或SCTP INIT/ECHO方式进行发现
-sL: List Scan 列表扫描，仅将指定的目标的IP列举出来，不进行主机发现
-Pn: 将所有指定的主机视作开启的，跳过主机发现的过程
-PO[protocollist]: 使用IP协议包探测对方主机是否开启 
-n/-R: -n表示不进行DNS解析；-R表示总是进行DNS解析 
--dns-servers <serv1[,serv2],...>: 指定DNS服务器。  
--system-dns: 指定使用系统的DNS服务器   
--traceroute: 追踪每个路由节点 
```

## 端口扫描

端口扫描是Nmap最基本最核心的功能，用于确定目标主机的TCP/UDP端口的开放情况。

```assembly
Nmap通过探测将端口划分为6个状态：
open：端口是开放的。
closed：端口是关闭的。
filtered：端口被防火墙IDS/IPS屏蔽，无法确定其状态。
unfiltered：端口没有被屏蔽，但是否开放需要进一步确定。
open|filtered：端口是开放的或被屏蔽，Nmap不能识别。
closed|filtered ：端口是关闭的或被屏蔽，Nmap不能识别
```



```bash
-sS: 这是Nmap默认的扫描方式，通常被称作半开放扫描
-sT:  扫描速度比较慢，并且建立完整的TCP连接会在目标主机上留下记录信息，不够隐蔽，-sS不能用情况下采用
-sA: 只能用于确定防火墙是否屏蔽某个端口，可以辅助-sS的方式来判断目标主机防火墙的状况
-sN/sF/sX:三种扫描方式相对比较隐蔽
-sU:  UDP扫描用于判断UDP端口的情况，向目标主机的UDP端口发送探测包，来判断哪些UDP端口是可能处于开放状态的
```

### 版本探测

版本侦测：用于确定目标主机开放端口上运行的具体的应用程序及版本信息。

```bash
-sV: 指定让Nmap进行版本侦测
--version-intensity <level>: 指定版本侦测强度（0-9），默认为7。数值越高，探测出的服务越准确，但是运行时间会比较长。
--version-light: 指定使用轻量侦测方式 (intensity 2)
--version-all: 尝试使用所有的probes进行侦测 (intensity 9)
--version-trace: 显示出详细的版本侦测过程信息
```

### OS侦测

OS侦测：用于检测目标主机运行的操作系统类型及设备类型等信息

```bash
-O: 指定Nmap进行OS侦测
--osscan-limit: 限制Nmap只对确定的主机的进行OS探测（至少需确知该主机分别有一个open和closed的端口）
--osscan-guess: 猜测对方的主机的系统类型。所以准确性会下降不少，但会尽可能多为用户提供潜在的操作系统
```

## 常用

```bash
nmap -sS 10.1.239.0/24		半连接最快扫描IP段，显示IP存活、端口开放状态、探测服务类型，默认1000以内的端口

nmap -sS -sV -O -A -v -p1-65535 113.142.137.216		扫描IP的所有端口和版本、枚举信息

nmap --script=vuln -p80,443 113.142.62.176 -d		用自带脚本库探测开放端口的信息和可能的漏洞
在nmap命令中，"-d"参数用于启用调试模式，它会在输出中提供更详细的信息，以帮助用户调试扫描问题。在这个命令中，"-d"参数告诉nmap在扫描过程中输出更详细的调试信息。

nmap -sS -sV -O -A -v -p1-65535 -iL ip.txt -oX nmap.xml		批量扫描ip.txt中IP并输出为xml（太慢不常用）
```

### 测试用

```bash
nmap -sn 10.1.239.0/24		探测存活

nmap --min-rate 10000 -p- 10.1.239.135		最小速率为10000扫描全端口

nmap -sU --min-rate 10000 -p- 10.1.239.135		UDP协议扫描端口

nmap -sT -sV -O -p80,111,777,52497,5353,40444 10.1.239.135		扫描服务版本和操作系统

nmap --script=vuln -p80,111,777,52497,5353,40444 100.1.239.135		自带脚本扫描漏洞
```

```bash
过waf

-f: 分片传输
nmap -f --min-rate 10000 -p- 10.1.239.135

--source-port: 伪造端口
nmap --source-port 53 --min-rate 10000 -p- 10.1.239.135  # 伪造为DNS服务

-r: 按顺序扫描，nmap默认是随即扫描
nmap -r --min-rate 10000 -p- 10.1.239.135

--scanflags: 改变扫描标志
nmap --scanflags URGPSHFIN --min-rate 10000 -p- 10.1.239.135  # 用这三个标志位进行扫描（防火墙可能只过滤标准的SYN扫描，这里使用TCP特定的URG、PSH、FIN标志，有时候会报告为filter）

-sU: UDP扫描
nmap -sU --top-ports 1000 10.1.239.135
```



### 无Nmap如何扫描

#### ping主机发现

```bash
1、命令：
ping -c 1 -W 1 10.1.239.138
-c		扫描1次
-W		超时时间
2、linux下bash语法：
for i in {1..254};do ping -c 1 -W 1 10.1.239.$i;done
会产生254个结果
ctrl+C			无法结束，ctrl+Z放入后台
kill -9 %1		%1 结束最新的一条命令
3、ping成功的有一个"from"字段
修改bash语法：
for i in {1..254};do ping -c 1 -W 1 10.1.239.$i | grep from;done
```

#### nc端口发现

```bash
1、命令：
nc.traditional -vv -z 10.1.239.138 1-65535
-z		零数据传输
产生65535条数据
2、筛选
nc.traditional -vv -z 10.1.239.138 1-65535 | grep -v refused
-v		反向筛选refused
筛选无效，显示了错误信息，只是对文字产生了过滤
3、重定向
nc.traditional -vv -z 10.1.239.138 1-65535 2>&1 | grep -v refused
2>&1	需要将错误输出重新输入给正常输入
```

#### 伪设备端口发现

```bash
echo $SHELL		/usr/bin/zsh zsh语法

┌──(dcj㉿dcj)-[~/桌面]
└─$ bash		首先得切换到bash中

1、伪设备
for i in {1..65535};do (echo < /dev/tcp/10.1.239.138/$i);done	伪设备 pseude device

2、命令
for i in {1..65535};do (echo < /dev/tcp/10.1.239.138/$i) &>/dev/null && printf "\n[+] The Open Port is: %d\n" "$i" | grep -v refused;done
&		没有指定1和2，包括正常1和错误2
&&		和，前面执行对了后面才执行，只有成功执行才会产生/dev/null，所以也可以不用grep
printf "\n[+] The Open Port is: %d\n" "$i"		C语言打印$i

3、执行
for i in {1..65535};do (echo < /dev/tcp/10.1.239.157/$i) &>/dev/null && printf "\n[+] The Open Port is: %d\n" "$i" || printf ".";done
|| printf "."		用或来打印，没有正确的时候就会打印"."
```

#### windows

```
需要两个工具进行代理转发：
chisel sshuttle
```

#### IPV6

```bash
工具：IOXIDResolver
https://github.com/mubix/IOXIDResolver

nmap -6 --min-rate 10000 -p- ipv6地址		-6 指定ipv6扫描


snmpwalk
snmp	简单网络协议
walk	枚举

-v	版本 -v2c
-c	指定社区、团体 public
sudo snmpwalk -v2c -c public 10.1.239.135
```



# 记录

```
-sn默认发送四种请求：1、icmp回显请求；2、默认对443端口的tcp syn请求；3、对80端口的tcp ack请求；4、默认下的icmp时间戳请求
```



```assembly
# 本地扫描
# 特权用户使用的是arp请求是数据链路层协议，不会发送上面4种请求
sudo nmap -sn 10.1.239.0/24
PS：10.1.239.0/24与10.1.239.1/24，0指的是网络地址，1指的是主机地址，建议使用0（nmap的容错比较高，所以结果是正常）
-sn 指的是no port scan，很容易的查看网络中的主机和可用性
# 与下列命令相似
sudo arp-scan -t

# 未使用特权用户则使用connect调用，发送syn数据包到目标主机的80、443端口
nmap nmap -sn 192.168.1.0/24

# 网络扫描发送4种请求包
```

```bash
sudo nmap -sT --min-rate 10000 -p- 192.168.1.108 -oA nmap/ports
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-02-26 15:05 CST                                     │
Nmap scan report for 192.168.1.108                                                                     │
Host is up (0.0045s latency).                                                                          │
Not shown: 65522 filtered tcp ports (no-response)                                                      │
PORT      STATE  SERVICE                                                                               │
25/tcp    open   smtp                                                                                  │
80/tcp    open   http                                                                                  │
110/tcp   open   pop3                                                                                  │
135/tcp   open   msrpc                                                                                 │
137/tcp   closed netbios-ns                                                                            │
139/tcp   open   netbios-ssn                                                                           │
445/tcp   open   microsoft-ds                                                                          │
1032/tcp  open   iad3                                                                                  │
1042/tcp  open   afrog                                                                                 │
2869/tcp  open   icslap                                                                                │
3306/tcp  open   mysql                                                                                 │
22331/tcp open   unknown                                                                               │
49666/tcp open   unknown
```

```bash
# -oA指的是输出三种输出格式
gnmap、nmap、xml
# 用awk将端口列输出
grep open nmap/ports.nmap | awk -F '/' '{print $1}'
25                                                                                                     │
80                                                                                                     │
110                                                                                                    │
135                                                                                                    │
139                                                                                                    │
445                                                                                                    │
1032                                                                                                   │
1042                                                                                                   │
2869                                                                                                   │
3306                                                                                                   │
22331                                                                                                  │
49666
# 用paste将端口格式化，用逗号分隔，-s是放在一行，-d指定分隔符
grep open nmap/ports.nmap | awk -F '/' '{print $1}' | paste -sd ','
25,80,110,135,139,445,1032,1042,2869,3306,22331,49666 

#可以指定临时变量ports来获取这些数据
ports=$(grep open nmap/ports.nmap | awk -F '/' '{print $1}' | paste -sd ',')
echo $ports
```

## 可视化工具

```bash
nmap -sV -F --script=http-title,ssl-cert -oX myoutput.xml 192.168.0.0/24
```

```bash
格式化到 SQLite 数据包：
https://github.com/hackertarget/nmap-did-what/blob/master/data/nmap-to-sqlite.py

python3 nmap-to-sqlite.py myoutput.xml
```

```bash
生成一个 nmap_results.db 数据库文件
```

```bash
启动 Grafana，使用 docker 启动：
https://github.com/hackertarget/nmap-did-what/blob/master/grafana-docker/docker-compose.yml

docker-compose up -d
```

```bash
默认端口 3000，默认账号密码 admin/admin
```
