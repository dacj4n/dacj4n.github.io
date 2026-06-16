---
title: kali更新源后桌面打不开
published: 2021-04-15 18:35
category: 系统
draft: false
tags: [Kali, Linux]
---

## 1、标题切换到root用户

```bash
su - root
```

## 2、更改apt源为国内源，保存并退出

```bash
vim /etc/apt/sources.list
```

以下三个源都可写入，建议只填写一个阿里源。添加太多在更新软件列表和程序可能要花费很多时间。

```bash
#阿里源
deb http://mirrors.aliyun.com/kali kali-rolling main non-free contrib
deb-src http://mirrors.aliyun.com/kali kali-rolling main non-free contrib
#中科大kali源
deb http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib
deb-src http://mirrors.ustc.edu.cn/kali kali-rolling main non-free contrib
#清华大学
deb http://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free
deb-src https://mirrors.tuna.tsinghua.edu.cn/kali kali-rolling main contrib non-free
```

## 3、更新系统

```bash
sudo apt update && apt upgrade && apt dist-upgrade

sudo apt-get clean
```

如果看到这句话的时候，apt --fix-broken install*****
直接敲apt --fix-broken install

## 4、安装xorg（xfce4环境必备）

```bash
sudo apt-get install xorg
```

## 5、安装Xfce4桌面环境

```bash
sudo apt-get install kali-defaults kali-root-login desktop-base xfce4 xfce4-places-plugin xfce4-goodies
```

## 6、解决桌面环境乱码问题

```bash
sudo apt install ttf-wqy-zenhei
```

重启计算机，之后便可正常使用图形界面

```bash
reboot
```
