---
title: 免杀魔改FRP内网隧道
published: 2025-04-15 10:35
tags: [安全, 内网穿透, FRP, 免杀]
category: 内网
draft: false
---

# 免杀魔改frp内网隧道

## **1、前言**

在渗透测试中都有流量代理转发的需求，但是现如今的安全设备的流量识别愈加强大，很多开源的工具都会被流量设备所识别，如果不进行特征的去除的话会被流量设备识别并告警，所以本文针对`frp`工具进行特征的去除。

## **2、魔改**

`frp`的基础流量，可以看到代理`ip`以及其他信息，存在一定的被朔源隐患。

![](/images/posts/frp-bypass-tunnel/1.png)

通过`frp`自带的加密参数设置：

```
加密和压缩通讯
use_encryption = true
use_compression = true
```

隐藏了部分流量信息

![](/images/posts/frp-bypass-tunnel/2.png)

继续修改特征

```
/pkg/msg/msg.go下修改基础特征
```

<img src="/images/posts/frp-bypass-tunnel/3.png" alt="3" style="zoom: 67%;" />

修改`ip`特征信息

<img src="/images/posts/frp-bypass-tunnel/4.png" alt="4" style="zoom:50%;" />

修改版本号信息

```
pkg/util/version/version.go
```

<img src="/images/posts/frp-bypass-tunnel/5.png" alt="5" style="zoom:50%;" />

重新编译运行

修改后的流量，基础特征已经修改

![](/images/posts/frp-bypass-tunnel/6.png)

开启`tls`加密

```
tls_enable = true
开启之前先修改tls首字节以免被识别
pkg/util/net/tls.go中FRPTLSHeadByte参数的值
默认为0x17
```

![](/images/posts/frp-bypass-tunnel/7.png)

重新编译在运行

此时抓到的流量跟刚开始的默认流量截然不同，已经看不见`ip`信息和其他基础信息。

![](/images/posts/frp-bypass-tunnel/8.png)

连通性测试

![](/images/posts/frp-bypass-tunnel/9.jpg)