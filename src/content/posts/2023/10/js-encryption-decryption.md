---
title: JS加解密
published: 2023-10-29 20:41
category: Web
draft: false
tags: [JS加密, 逆向, Web]
---

## 0x00 测试环境

```
https://my.sto.cn/
```

![](/images/posts/js-encryption-decryption/1.jpg)

![](/images/posts/js-encryption-decryption/2.jpg)

## 0x01 断点调试方法

```assembly
# 代码全局搜索
# 文件流程断点
# 代码标签断点
# XHR提交断点

# 调用堆栈：（由下到上）简单来说就是代码的执行逻辑顺序
```

### 代码全局搜索

![](/images/posts/js-encryption-decryption/3.jpg)

通过post请求Vip/LoginResult路径，将data中的logindata数据提交，向上找加密算法

![](/images/posts/js-encryption-decryption/4.jpg)

![](/images/posts/js-encryption-decryption/5.jpg)

没有定义，再向上寻找定义的方法，找到定义方法

![](/images/posts/js-encryption-decryption/6.jpg)

得到加密值

![](/images/posts/js-encryption-decryption/7.jpg)

### 文件流程断点

![](/images/posts/js-encryption-decryption/8.jpg)

这里查看调用堆栈，可以知道有哪些文件在请求中被调用了，运行方式为：由下往上

点击`Login`跳转到调用位置

![](/images/posts/js-encryption-decryption/9.jpg)

点击添加断点

![](/images/posts/js-encryption-decryption/10.jpg)

再次提交表单则会被拦截

![](/images/posts/js-encryption-decryption/11.jpg)

鼠标放在`logindata`上发现已经被加密了，在作用域中查看

![](/images/posts/js-encryption-decryption/12.jpg)

![](/images/posts/js-encryption-decryption/13.jpg)

在`Login`和`(anonymous)`之间存在加密方式，进入`Login()`函数进行了加密

![](/images/posts/js-encryption-decryption/14.jpg)

向上找可以发现调用的js文件

![](/images/posts/js-encryption-decryption/15.jpg)

### 代码标签断点

找到源代码，右键断电，根据情况选择子树修改、属性修改和移除节点

![](/images/posts/js-encryption-decryption/16.jpg)

![](/images/posts/js-encryption-decryption/17.jpg)

![](/images/posts/js-encryption-decryption/21.jpg)

### XHR提交断点

添加一个XHR断点，这里添加的是请求的路径，前面得知了是`/Vip/LoginResult`

![](/images/posts/js-encryption-decryption/18.jpg)

![](/images/posts/js-encryption-decryption/19.jpg)

得到断点

![](/images/posts/js-encryption-decryption/20.jpg)

## 0x02 实例

```
https://account.hpc.sjtu.edu.cn/#/login
```

代码标签断点得到的内容有些混乱

![](/images/posts/js-encryption-decryption/21.jpg)

直接在网络跟踪栈

![](/images/posts/js-encryption-decryption/22.jpg)

添加断点后重新提交

![](/images/posts/js-encryption-decryption/23.jpg)

得到JS加密函数和加密方式，这个s很明显是加密后的数值，o是设置的公钥

![](/images/posts/js-encryption-decryption/24.jpg)

保存这个被调用的js文件，在本地进行测试

![](/images/posts/js-encryption-decryption/25.jpg)

```
o = "305c300d06092a864886f70d0101010500034b003048024100959684a0076fd2a8fc1589469cf8c95f16ef67490c519f4d274373f29cee64cf6a0db8ad8953122c5b3664e4a48acd34d9b95c0ae62a31be612632e1c49154db0203010001"
```

```
var r = new JSEncrypt,o = "305c300d06092a864886f70d0101010500034b003048024100959684a0076fd2a8fc1589469cf8c95f16ef67490c519f4d274373f29cee64cf6a0db8ad8953122c5b3664e4a48acd34d9b95c0ae62a31be612632e1c49154db0203010001";
r.setPublicKey(o);
var s = r.encrypt('123456');
console.log(s);
```

![](/images/posts/js-encryption-decryption/26.jpg)