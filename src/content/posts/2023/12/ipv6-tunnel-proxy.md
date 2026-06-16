---
title: IPV6隧道代理
published: 2023-12-22 16:12
category: 内网
draft: false
tags: [内网穿透, IPv6, Linux]
---


## HE Tunnel Broker 设置教程

### 创建 Tunnel Broker IPv6 隧道

- 注册 Tunnel Broker 账号

  ```
  https://www.tunnelbroker.net/
  ```

  点击左侧的`Create Regular Tunnel`(创建常规隧道)

- 输入 VPS 的公网 IP 地址

- 根据 VPS 的位置选择一个合适的节点

- 页面拉到最下方，点击

  ```
  Create Tunnel
  ```

  (创建隧道)

![](/images/posts/ipv6-tunnel-proxy/1.png)

在 **Tunnel Details** 页面可以看到创建的 IPv6 隧道的详细信息，其中 **Client IPv6 Address** 是申请到公网 IPv6 地址。

![](/images/posts/ipv6-tunnel-proxy/2.png)

### 获取配置示例

在 **Tunnel Details** 页面有个 **Example Configuration** 选项卡，在这里你可以选择合适的配置示例。就比如这里有 De­bian/Ubuntu 的 `interfaces` 配置文件示例：

![](/images/posts/ipv6-tunnel-proxy/3.png)

只要基于 De­bian 的发行版和使用 `interfaces` 配置文件的系统理论上都可以使用。其它不兼容的发行版则可以使用 **Linux-net-tools** 或 **Linux-route2** 示例手动输入命令，出现下面`ping`的结果就证明成功了。

![](/images/posts/ipv6-tunnel-proxy/4.jpg)

### 添加 IPv6 网络接口

将 `he-ipv6` 配置文件添加到 `/etc/network/interfaces.d/` 目录下。下面是一把梭命令示例，根据实际情况替换文本。

```bash
sudo tee /etc/network/interfaces.d/he-ipv6 <<EOF
auto he-ipv6
iface he-ipv6 inet6 v4tunnel
        address 2001:xxx:xxxx:xxxx::2
        netmask 64
        endpoint 216.66.84.46
        local 233.xxx.xxx.233
        ttl 255
        gateway 2001:xxx:xxxx:xxxx::1
EOF
```

> **TIPS:** 如果是 NAT VPS 或 VPC 内网方案则需要将`local`字段后面的公网 IP 替换为内网 IP 。获取命令：`ip route get 8.8.8.8 | grep -oP 'src \K\S+'`。

### 启用 IPv6 隧道

- 安装网络工具包

  ```bash
  sudo apt update
  sudo apt install net-tools iproute2 -y
  ```

- 启动 `he-ipv6` 网络接口

  ```bash
  sudo ifup he-ipv6
  ```

  > **TIPS**：若提示 **ifup: unknown interface he-ipv6** ，则添加`source /etc/network/interfaces.d/*`到`/etc/network/interfaces`文件（一把梭命令：`echo 'source /etc/network/interfaces.d/*' >>/etc/network/interfaces`）后重试，正常情况下无输出。

- 启用后执行 `ifconfig` 命令，这时应该有一个 `he-ipv6` 接口，类似下面这样：

  ```txt
  he-ipv6: flags=209<UP,POINTOPOINT,RUNNING,NOARP>  mtu 1480
            inet6 2001:xxx:xxxx:xxxx::2  prefixlen 64  scopeid 0x0<global>
            inet6 fe80::xxxx:xxxx  prefixlen 64  scopeid 0x20<link>
            sit  txqueuelen 1000  (IPv6-in-IPv4)
            RX packets 11605  bytes 3127821 (3.1 MB)
            RX errors 0  dropped 0  overruns 0  frame 0
            TX packets 13811  bytes 2403522 (2.4 MB)
            TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
  ```

- 若没有生效可以尝试重启网络

  ```bash
  sudo systemctl restart networking
  ```

## 其它操作

### 检测 IPv6 支持

执行 `ping6 google.com` 命令，能 ping 通说明 VPS 已经支持 IPv6 网络了。

### NAT VPS 的额外设置

IPv4 NAT VPS 除了前面提到的替换 IP 操作以外，可能还需要一些额外的设置，否则可能还是无法访问 IPv6 网络。

- 配置防火墙允许 41 端口入站

  ```bash
  ufw allow 41
  ```

- 添加相关的路由规则

  ```bash
  route -A inet6 add ::/0 dev he-ipv6
  ```

### DNS 设置优化

> **TIPS:** 以下设置仅针对操作系统 DNS ，代理软件应单独设置内置的 DNS 和 IP 分流策略，具体参考相关软件文档中的 DNS 和路由部分。

#### 选择合适的 DNS 解析服务器

因为通过 IPv6 隧道去请求可能会拖慢 DNS 解析速度，所以一般不建议在系统中使用 IPv6 地址的 DNS。

编辑 `/etc/resolv.conf` 文件，更改 DNS 解析服务器为支持查询 AAAA 记录的 DNS 服务器，比如 [Google Public DNS](https://p3terx.com/go/aHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vc3BlZWQvcHVibGljLWRucw)。

```txt
nameserver 8.8.8.8
nameserver 8.8.4.4
```

#### 优先使用 IPv4 网络

默认情况下 IPv6 网络优先级会高于 IPv4 ，为了防止 IPv6 隧道拖慢 VPS 的正常网速，可以设置优先使用 IPv4 网络。同时也能减轻了对 HE Tun­nel Bro­ker 节点的网络压力，合理使用宝贵的免费资源。

编辑 `/etc/gai.conf` 文件，在末尾添加下面这行配置：

```txt
precedence  ::ffff:0:0/96   100
```

一键添加命令如下：

```bash
echo 'precedence  ::ffff:0:0/96   100' | sudo tee -a /etc/gai.conf
```

完事执行 `curl ip.p3terx.com` 命令，显示 VPS 的 IPv4 地址则代表成功。

### 删除 HE IPv6 隧道

不想用了，或者想使用其它方式访问 IPv6 网络时，记得先删除。

- 停用隧道

  ```bash
  sudo ifdown he-ipv6
  ```

- 删除 `he-ipv6` 网络接口配置文件（若没有删除重启后会自动启用）

  ```bash
  sudo rm -f /etc/network/interfaces.d/he-ipv6
  ```

### 使用`IPv6`地址进行访问

```bash
curl -6 -I --interface 2001:470:18:a8c::2 "网站url"
# -6 访问ipv6地址
# -I 选择网卡
# --interface 选择使用访问的网络接口
```

![](/images/posts/ipv6-tunnel-proxy/5.jpg)

结果如下：

<img src="/images/posts/ipv6-tunnel-proxy/6.jpg" alt="6" style="zoom:50%;" />