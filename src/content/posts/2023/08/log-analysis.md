---
title: 日志信息分析示例
published: 2023-08-25 21:24
tags: [日志分析]
category: 工具
draft: false
---

```
渗透过程中，我们可能用普通账号进到了系统，在提权或者进一步信息收集的过程中，我们会获得一些日志文件，根据这些日志文件我们需要进一步的分析。
```

## 日志文件

下面是Kali官方给的日志文件，根据这个日志，讲述一下信息收集的方法：

```shell
wget http://www.offensive-security.com/pwk-files/access_log.txt.gz
```

![](/images/posts/log-analysis/1.jpg)

## 分析文件

可以使用wc命令查看文件行数

```shell
wc -l access_log.txt 
[-]	1173 access_log.txt
```

```shell
ls -lh access_log.txt 
[-]	-rwxrwxrwx 1 root root 138K 2020年 2月11日 access_log.txt
```

量还是很大的，基本都是web访问

![](/images/posts/log-analysis/2.jpg)

## 过滤地址

由于第一列为IP地址列，且可以通过空格来进行分割

```shell
cat access_log.txt | cut -d " " -f 1

cat access_log.txt: 这部分使用cat命令来将文件 access_log.txt 的内容输出到标准输出（通常是终端）。

|: 这是管道操作符，它将 cat 命令的输出传递给下一个命令。

cut -d " " -f 1: 这部分使用cut命令来分割输入，并且 -d 参数指定了分隔符（空格），而 -f 参数指定了要提取的字段编号（这里是第一个字段，即每行的第一个单词或字符串）。
```

![](/images/posts/log-analysis/3.jpg)

## 统计去重

原有基础上进行去重并统计出现次数

```shell
cat access_log.txt | cut -d " " -f 1 | uniq -c

uniq -c: 这部分使用uniq命令来查找连续重复的行（在这里是IP地址），并使用 -c 参数来计算每个唯一行（唯一的IP地址）出现的次数。
```

![](/images/posts/log-analysis/4.jpg)

这里的IP并不多，若IP过多则需要对结果进行逆序排序

```shell
cat access_log.txt | cut -d " " -f 1 | uniq -c | sort -run

sort -run: 这部分使用sort命令来对IP地址出现次数进行逆序排序，其中：

-r 参数表示逆序排序（从高到低）。
-u 参数表示去重（只显示唯一的IP地址）。
-n 参数表示按数值大小排序，而不是按字典顺序。
```

![](/images/posts/log-analysis/5.jpg)

## 结果筛选

分析并发现了访问次数最多的IP地址，可以针对此IP进行筛选

```sh
cat access_log.txt| grep 208.68.234.99
```

![](/images/posts/log-analysis/6.jpg)

发现此IP对/admin接口进行大量访问，且可能已经爆破成功

```shell
cat access_log.txt| grep 208.68.234.99 | grep "/admin" | sort -u
```

![](/images/posts/log-analysis/7.jpg)
