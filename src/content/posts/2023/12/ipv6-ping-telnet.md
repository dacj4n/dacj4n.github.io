---
title: IPv6地址使用ping和telnet命令汇总
published: 2023-12-21 11:27
category: 工具
draft: false
tags: [IPv6, Linux, Windows]
---

## 简述

> 本文主要介绍IPV6通信时，IPv6地址的ping、telnet操作。

## 实验环境

```
Linux：CentOS Linux release 7.2.1511 (Core)

Windows：Windows 10家庭中文版
```

## windows ping linux

```
命令：ping -6 linux_ipv6地址%windows接口序号
```

**查询windows接口序号**

```
命令：ipconfig –all
```

通过ipconfig-all命令查看到ipv6地址如下：

```
fe80::cd04:c16b:9adf:dfe7%22

%后面是本ipv6地址对应的网络接口的index，windows术语叫scope id，可理解为一个接口序号，则22为当前windows接口序号。
```

![](/images/posts/ipv6-ping-telnet/1.png)

**查询linux_ipv6地址**

```
命令：ip addr
```

通过ip addr命令查看到ipv6地址如下：

```
fe80::20c:29ff:fea4:1509
```

![](/images/posts/ipv6-ping-telnet/2.png)

**windows ping linux**

```
ping -6 fe80::20c:29ff:fea4:1509%22
```

![](/images/posts/ipv6-ping-telnet/3.png)

## linux ping windows

```
命令：ping6 -I linux_接口名 win_ipv6地址
```

**查看linux接口名**

```
命令：ip addr
```

通过ip addr命令查看到linux接口名为**eno16777736**

![](/images/posts/ipv6-ping-telnet/4.png)

**linux ping windows**

ping6 -I **eno16777736** fe80::cd04:c16b:9adf:dfe7

![](/images/posts/ipv6-ping-telnet/5.png)

## linux ping linux

（A服务器上ping另外一台服务器B）

命令：ping6 –I **A服务器linux接口名 B服务器linux_ipv6地址**

**查看A服务器linux接口名**

命令：ip addr

通过ip addr命令查看到**A服务器linux接口名**为**eno16777736**

![](/images/posts/ipv6-ping-telnet/6.png)

**查看B服务器linux_ipv6地址**

命令：ip addr

通过ip addr命令查看到ipv6地址如下：

fe80::20c:29ff:feaa:9a1b

![](/images/posts/ipv6-ping-telnet/7.png)

**linux ping linux**

```
ping6 -I eno16777736 fe80::20c:29ff:feaa:9a1b
```

![](/images/posts/ipv6-ping-telnet/8.jpg)

## windows telnet linux_ipv6端口

```
命令：telnet linux_ipv6地址%windows接口序号 端口
```

**查询linux_ipv6地址**

```
命令：ip addr
```

通过ip addr命令查看到ipv6地址如下：

```
fe80::20c:29ff:feaa:9a1b
```

![](/images/posts/ipv6-ping-telnet/9.png)

**查询windows接口序号**

```
命令：ipconfig –all
```

通过ipconfig-all命令查看到ipv6地址如下：

```
fe80::cd04:c16b:9adf:dfe7%22
```

%后面是本ipv6地址对应的网络接口的index，windows术语叫scope id，可理解为一个接口序号，则22为当前windows接口序号。

![](/images/posts/ipv6-ping-telnet/10.png)

**查看服务端口**

```
命令：lsof -i: 端口号
```

![](/images/posts/ipv6-ping-telnet/11.png)

**windows telnet 服务80端口**

```
telnet fe80::20c:29ff:feaa:9a1b%22 80
```

![](/images/posts/ipv6-ping-telnet/12.png)

![](/images/posts/ipv6-ping-telnet/13.png)

## linux telnet linux_ipv6端口

（B服务器telnet另一台A服务器上的80端口）

```
命令：telnet -6 A_linux_ipv6地址%B_linux接口名 A_服务器80端口
```

查看**A_linux_ipv6地址**

```
命令：ip addr
```

通过ip addr命令查看到A_linux_ipv6地址如下：

```
fe80::20c:29ff:feaa:9a1b
```

![](/images/posts/ipv6-ping-telnet/14.png)

**查看B**_**linux接口名**

```
命令：ip addr
```

通过ip addr命令查看到B_linux_ipv6接口名为**eno16777736**

![](/images/posts/ipv6-ping-telnet/15.png)

查看**A_服务器80端口**

```
命令：lsof –i:端口
```

```
lsof –i:80
```

![](/images/posts/ipv6-ping-telnet/16.png)

**linux telnet linux_ipv6端口**

```
telnet -6 fe80::20c:29ff:feaa:9a1b%eno16777736 80
```

![](/images/posts/ipv6-ping-telnet/17.png)