---
title: FRP 隧道配置参考
published: 2025-09-11 17:55
tags: [安全, 内网穿透, FRP]
category: 内网
draft: false
---

# 老版本ini

## 服务端

```assembly
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = dcjdcjdcjdcjdcj

admin_user = dcj
admin_pwd = 135728Qq
```

## 客户端

```assembly
[common]
server_addr = 10.1.239.129
server_port = 7000
token = dcjdcjdcjdcjdcj

admin_user = dcj
admin_pwd = 135728Qq
 
[http_port_1]
type = tcp
local_ip = 127.0.0.1
local_port = 32400
remote_port = 18080

[http_port_2]
type = tcp
local_ip = 127.0.0.1
local_port = 6677
remote_port = 18081

[socks5]
type = tcp
local_ip = 10.1.239.134
remote_port = 1080
local_port = 8888
plugin = socks5
```

# 新版本toml

## 服务端

```assembly
# frps.toml
bindPort = 7000 # 服务端与客户端通信端口

transport.tls.force = true # 服务端将只接受 TLS链接

auth.token = "public" # 身份验证令牌，frpc要与frps一致

# Server Dashboard，可以查看frp服务状态以及统计信息
webServer.addr = "0.0.0.0" # 后台管理地址
webServer.port = 7500 # 后台管理端口
webServer.user = "admin" # 后台登录用户名
webServer.password = "admin" # 后台登录密码
```

## 客户端

```assembly
# frpc.toml
transport.tls.enable = true # 从 v0.50.0版本开始，transport.tls.enable的默认值为 true
serverAddr = "x.x.x.x"
serverPort = 7000 # 公网服务端通信端口

auth.token = "public" # 令牌，与公网服务端保持一致

[[proxies]]
name = "test-http"
type = "tcp"
localIP = "127.0.0.1" # 需要暴露的服务的IP
localPort = 80 # 将本地9000端口的服务暴露在公网的6060端口
remotePort = 6060 # 暴露服务的公网入口

[[proxies]]
name = "ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000

[[proxies]]
name = "socks5"
type = "tcp"
remotePort = 6028

[proxies.plugin]
type = "socks5"
```

