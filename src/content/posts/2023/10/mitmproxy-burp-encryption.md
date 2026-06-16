---
title: mitmproxy加载burp加解密
published: 2023-10-29 18:40
category: 工具
draft: false
tags: [mitmproxy, Burp, 加解密, Web]
---



## 0x00 安装

在 linux 中：

```text
sudo pip3 install mitmproxy
```

在 windows 中，以管理员身份运行 cmd 或 power shell：

```text
pip3 install mitmproxy
```

安装结束。

完成后，系统将拥有 `mitmproxy`、`mitmdump`、`mitmweb` 三个命令，由于 `mitmproxy` 命令不支持在 windows 系统中运行（这没关系，不用担心），我们可以拿 `mitmdump` 测试一下安装是否成功，执行：

```text
mitmdump --version
```

应当可以看到类似于这样的输出：

```text
Mitmproxy: 9.0.1
Python:    3.9.2
OpenSSL:   OpenSSL 3.0.7 1 Nov 2022
Platform:  Windows-10-10.0.22621-SP0
```

## 0x01 使用

固定格式：

```python
from mitmproxy import http


class AutoDecoderClass(object):

    def request(self, flow: http.HTTPFlow):
        pass

    def response(self, flow: http.HTTPFlow):
        pass


addons = [
    AutoDecoderClass()
]
```

针对burp重放包中的数据进行加解密

```python
from mitmproxy import http
import json
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from pwn import *

key = b'0ddmas1dfzcaedev'


def encrypt(text, key):
    cipher = AES.new(key, AES.MODE_ECB)
    padded_text = pad(text.encode('utf-8'), AES.block_size)
    encrypted_data = cipher.encrypt(padded_text)
    return b64e(encrypted_data).decode('utf-8')


def decrypt(encoded_text, key):
    cipher = AES.new(key, AES.MODE_ECB)
    encrypted_data = b64e(encoded_text.encode('utf-8'))
    decrypted_data = unpad(cipher.decrypt(encrypted_data), AES.block_size)
    return decrypted_data.decode('utf-8').encode('utf-8')


class AutoDecoderClass(object):

    def request(self, flow: http.HTTPFlow):

        # 如果body中有data字段
        if flow.request.method == 'POST' and flow.request.headers['Content-Type'] == 'application/json;charset=utf-8':
            # 如果是json格式
            if 'data' in json.loads(flow.request.content):
                print()
            else:
                flow.request.content = json.dumps({'data': encrypt(flow.request.content.decode('utf-8'), key)}).encode('utf-8')
                print(flow.request.content)

    def response(self, flow: http.HTTPFlow):
        print(flow.request.content)
        pass


addons = [
    AutoDecoderClass()
]
```

## 0x02 实例

```
环境：
JeeSite V5.3.1
默认口令：
system
admin
```

此站点的加密是base64

```python
from mitmproxy import http
import base64


class AutoDecoderClass(object):

    def request(self, flow: http.HTTPFlow):
        if flow.request.method == 'POST' and flow.request.headers['Content-Type'] == 'application/x-www-form-urlencoded; charset=UTF-8':
            # print(flow.request.content)
            data = flow.request.content.decode('utf-8').split('&')
            for i in range(len(data)):
                if data[i].split('=')[0] == 'username':
                    data[i] = 'username=' + base64.b64encode(data[i].split('=')[1].encode('utf-8')).decode('utf-8')
                if data[i].split('=')[0] == 'password':
                    data[i] = 'password=' + base64.b64encode(data[i].split('=')[1].encode('utf-8')).decode('utf-8')
            data = '&'.join(data)
            print(data)
            flow.request.content = data.encode('utf-8')

        pass

    def response(self, flow: http.HTTPFlow):
        pass


addons = [
    AutoDecoderClass()
]
```

### 启动命令

```
mitmdump -s demo2_base64.py --ssl-insecure --listen-port 55555 --mode socks5
```

<img src="/images/posts/mitmproxy-burp-encryption/4.jpg" alt="4" style="zoom:50%;" />

### 数据包重放

<img src="/images/posts/mitmproxy-burp-encryption/1.jpg" alt="1" style="zoom: 50%;" />

<img src="/images/posts/mitmproxy-burp-encryption/2.jpg" alt="2" style="zoom: 50%;" />

### 使用插件

<img src="/images/posts/mitmproxy-burp-encryption/3.jpg" alt="3" style="zoom:50%;" />

