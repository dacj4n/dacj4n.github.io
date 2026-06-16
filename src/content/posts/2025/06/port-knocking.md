---
title: 端口敲门 (Port Knocking)
published: 2025-06-15 09:30
tags: [Linux]
category: 内网
draft: false
---

```
攻击者在攻击第一阶段进行资产漏洞扫描时，如果防守方突然通过某种方式给信息资产穿上了一层隐身衣，会是怎样一种情形？攻击者会发现无论是fping、nmap、zmap又或者是openvas、nessus、wvs等各种扫描工具均无功而返，根本不能和想攻击的服务器或应用建立任何的网络层连接，之前预先准备好的各种攻击工具、POC和0Day漏洞等招数全部落空，一脸郁闷吧。尽管现实中的实际情况不会这么绝对，但如果防守方可以把关键信息资产（如对外开放的公网服务、内部办公应用系统等）进行统一隐身管理，必然可以大大降低公司整体信息资产风险，显著提升公司安全防范能力。
```

## 0x00 简介

端口敲门是一种通过在一组预先指定的关闭端口上产生连接请求，从外部打开防火墙上的端口的方法。一旦收到正确地连接请求序列，防火墙规则就会被动态修改，以允许发送连接请求的主机通过特定端口进行连接。

端口敲门的主要目的是防止攻击者通过进行端口扫描来扫描系统中潜在的可利用服务，因为除非攻击者发送正确的碰撞序列，否则受保护的端口将显示为关闭。


## 0x01 配置

安装`knockd`，在`/etc/`文件夹下生成`knockd.conf`文件

```scss
cat /etc/knockd.conf
[options]
    UseSyslog
[openSSH]
    sequence    = 7000,8000,9000
    seq_timeout = 5
    command     = /sbin/iptables -A INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
    tcpflags    = syn
[closeSSH]
    sequence    = 9000,8000,7000
    seq_timeout = 5
    command     = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
    tcpflags    = syn
```

```
配置文件里有两个参数:

sequence 按照顺序依次访问端口，command执行的条件。比如这里是依次访问7000, 8000, 9000端口，默认使用TCP访问。
command 当knockd监测到sequence端口访问完成，然后执行此处command，这里为通过iptables开启关闭ssh外部访问。
```

## 0x02 原理

端口敲门是一种通过服务器上关闭的端口来传输约定信息的方法，从而在用户访问受保护服务之前对用户进行身份验证，主要用于对公网开放的服务如`sshd`进行安全防护。

![1](/images/posts/port-knocking/1.jpg)

主机防火墙默认规则是`DROP`所有请求包，从外网来说，没有任何方法可以确认服务器是否存活（备注：因为`DROP`规则不会发送响应包，从而避免扫描器根据响应包确认端口的开放情况。`REJECT/DENY`规则会发送`ICMP_PORT_UNREACHABLE`返回给客户端，扫描器如`nmap`可据此判断出端口状态是`filter`，从而暴露服务器本身是存活的，端口是开放的，但禁止扫描器IP访问）；


![2](/images/posts/port-knocking/2.jpg)

`Port-Knocking`守护进程运行在服务端，并在主机防火墙`DROP`数据包时进行分析，如果某个源IP发送的一系列`TCP`或`UDP`数据包是按照服务端预先设定的特定顺序访问了对应的一组`TCP`或`UDP`端口（表示敲门暗语正确），则`knockd`进程自动调用`iptables`命令执行配置文件中预设的对应规则，如增加一条允许该`IP`地址访问服务器`SSH`端口的规则。如果数据包不满足服务端预设的端口访问顺序，则守护进程不会执行任何操作。

- `Port-Knocking`带来的安全性提升

服务器是否在线对攻击者来说不可感知
服务器主机防火墙默认`DROP`所有请求的数据包，因此攻击者不能通过扫描器确认服务器是否存活，以及服务器上开放的任何端口。

- 漏洞服务不会对外暴露

访问服务器上对外开放端口所对应的服务需要预先知晓敲门顺序，所以即使对外开放的服务如`SSH`等存在哪怕是`0day`漏洞，攻击者也无法利用。不存在暴力破解、字典攻击、协议漏洞等安全问题。

- 建立多层防御体系

端口敲门顺序是受信用户才应知晓的秘密口令，因此某种程度来说，敲门顺序和密码一样，也是一种用户身份验证机制。只有输入了正确地敲门顺序后，才会允许访问对应的服务，即在所访问服务之前增加了一层用户身份认证防护。

## 0x03 碰撞

前提是需要我们知道端口碰撞的序列，否则暴力碰撞开启的机会太小

### 1、手工构造

- 打开`SSH iptables`

```bash
telnet  <target IP> 7000
telnet  <target IP> 8000
telnet  <target IP> 9000
```

- 关闭`SSH iptables`

```bash
telnet  <target IP> 9000
telnet  <target IP> 8000
telnet  <target IP> 7000
```

### 2、使用knock程序

```bash
开启
knock  <target IP>  7000 8000 9000
关闭
knock  <target IP>  9000 8000 7000
```

### 3、NC 或者 Nmap

```bash
Open:
nc -z <target IP> 7000 8000 9000
Close:
nc -z <target IP> 9000 8000 7000
```

```bash
for x in  7000 8000 9000; do nmap -Pn --host_timeout 201 --max-retries 0 -p $x  <target IP> ; done
```
