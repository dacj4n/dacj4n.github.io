---
title: Oracle数据库SQL注入环境搭建
published: 2023-12-12 17:49
tags: [SQL注入, 数据库]
category: Web
draft: false
---

# Oracle数据库SQL注入环境搭建

## 0x00 安装 Oracle

```
使用Docker进行安装
```

要下载的镜像较大, 建议 https://cr.console.aliyun.com/cn-qingdao/instances/mirrors

```bash
https://s2vfan7w.mirror.aliyuncs.com

1. 安装／升级Docker客户端
推荐安装1.10.0以上版本的Docker客户端，参考文档docker-ce

2. 配置镜像加速器
针对Docker客户端版本大于 1.10.0 的用户

您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://s2vfan7w.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

更换源之后，直接`pull Oracle`镜像， 这里选择 https://github.com/MaksymBilenko/docker-oracle-12c 镜像。

```bash
docker pull sath89/oracle-12c
```

## 0x01 启动 Oracle

```bash
docker run --name myoracle -d -p 8080:8080 -p 1521:1521 -e ORACLE_ALLOW_REMOTE=true -v /Users/hua/docker/Oracle:/u01/app/oracle sath89/oracle-12c
```

```assembly
参数解释如下：

--name: 容器名字
-d：后台运行容器, 并返回容器ID
-p 本机端口:容器端口: 端口映射
-e ORACLE_ALLOW_REMOTE=true: 设置允许远程连接.
-v 本地目录:容器目录: 挂载本地目录, 将数据保留在本机来达到数据持久化的目的, 要不每次起的容器都是全新的.
```

运行完上面的命令之后，需要等待容器初始化，可以通过下面命令查看进度。

```bash
docker logs -f myoracle
```

当最底下出现`Database ready to use. Enjoy! ;)`后代表初始化成功。

不知道为什么用上述办法导致创建的容易一直会闪退出，刚运行起来就关闭了，总之我用了下述方法，简单粗暴。

```bash
docker run -it -d -p 8080:8080 -p 1521:1521 sath89/oracle-12c
```

接下来进入容器：

```bash
docker exec -it myoracle env LANG=C.UTF-8 /bin/bash
```

进入容器这里用的也是简单粗暴：

```bash
docker exec -it cranky_greider /bin/bash
```

先创建`sqlplus`的软链接：

```bash
ln -s $ORACLE_HOME/bin/sqlplus /usr/bin
```

然后切换到`oracle`账户：

```bash
su oracle
```

连接`Oracle`：

```bash
sqlplus / as sysdba
```

<img src="/images/posts/oracle-sqli-setup/1.jpg" alt="1" style="zoom:50%;" />

接下来新建一个表测试一下：

```sql
create table student (
   xh number(4), -- 学号
   xm varchar2(20), -- 姓名
   sex char(2), -- 性别
   birthday date, -- 出生日期
   sal number(7,2) -- 奖学金
);
```

<img src="/images/posts/oracle-sqli-setup/2.jpg" alt="2" style="zoom:50%;" />

下面的一般测试持久化是由于会删除容器，我这里不删除所以不进行持久化了，至此, Oracle 安装完成！

## 0x02 apache-php-oracle

https://github.com/thomasbisignani/docker-apache-php-oracle

```bash
docker pull thomasbisignani/docker-apache-php-oracle
```

在本地新建一个测试`php`，其中的`ip`为本机的`ip`，端口为`Oracle`映射出来的端口。

```php
<?php

$username = 'system';
$password = 'oracle';

$connectText = '//10.1.239.138:1521/XE';

$conn = oci_connect($username, $password, $connectText);
if (!$conn) {
    $e = oci_error();
    echo 'Oracle connect failed <br />';
    exit($e['message']);
}

echo 'Oracle connect ok'."<br>";
?>
```

<img src="/images/posts/oracle-sqli-setup/3.jpg" alt="3" style="zoom:50%;" />

## 0x03 测试

1、创建数据表空间

```sql
create tablespace pentest datafile '/u01/app/oracle/oradata/xe/pentest.dbf' size 100m;
```

2、创建用户并指定表空间

```sql
create user pentest identified by pentest default tablespace pentest;
```

3、给用户授予权限因为是测试注入所以给权限

```sql
grant connect,resource,dba to pentest;
```

4、`exit`退出并以`pentest`登录

```bash
$ORACLE_HOME/bin/sqlplus pentest/pentest
```

<img src="/images/posts/oracle-sqli-setup/4.jpg" alt="4" style="zoom:50%;" />

5、建表并插入数据

```sql
 CREATE TABLE users (
     id number,
     name varchar(500),
     surname varchar(1000)
 );

 INSERT INTO users (id, name, surname) VALUES (1, 'luther', 'blisset');
 INSERT INTO users (id, name, surname) VALUES (2, 'fluffy', 'bunny');
 INSERT INTO users (id, name, surname) VALUES (3, 'wu', 'ming');
 INSERT INTO users (id, name, surname) VALUES (4, 'sqlmap/1.0-dev (http://sqlmap.org)', 'user agent header');
 INSERT INTO users (id, name, surname) VALUES (5, NULL, 'nameisnull');
 commit;
```

这里我用的`Navicat`，连接`Navicat`的问题在文末有写，记得`insert`完要`commit`。

<img src="/images/posts/oracle-sqli-setup/5.jpg" alt="5" style="zoom:50%;" />

6、然后修改`php`文件如下：

```bash
# 由于环境内没有vi和vim编辑器，只能通过docker cp进行传输文件
docker cp ./test.php 6ae0e91be12e:/var/www/html/
```

```php
 <?php
 $username = 'pentest';
 $password = 'pentest';
 $connectText = '//10.1.239.138:1521/XE';
 $conn = oci_connect($username, $password, $connectText);
 if (!$conn) {
     $e = oci_error();
     echo 'Oracle connect failed <br />';
     exit($e['message']);
 }
 echo 'Oracle connect ok' . "<br>";
 // Prepare the statement
 if (!isset($_GET['id']) || $_GET['id'] == null) {
     echo "oracle sqlinjection test: oracle_test.php?id=1</br>";
     $stid = oci_parse($conn, "select * from USERS");
 } else {
     //SQL injection!!!!!!
     $stid = oci_parse($conn, "SELECT * FROM users where id=" . $_GET['id']);
 }
 if (!$stid) {
     $e = oci_error($conn);
     exit($e['message']);
 }
 // Perform the logic of the query
 $r = oci_execute($stid);
 if (!$r) {
     $e = oci_error($stid);
     exit($e['message']);
 }
 // Fetch the results of the query
 print "<table border='1'>\n";
 while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
     print "<tr>\n";
     foreach ($row as $item) {
         $item = ($item !== null ? mb_convert_encoding($item, 'utf-8', 'gbk') : " ");
         print "    <td>" . $item . "</td>\n";
     }
     print "</tr>\n";
 }
 print "</table>\n";
 oci_free_statement($stid);
 oci_close($conn);
 ?>
```

<img src="/images/posts/oracle-sqli-setup/6.jpg" alt="6" style="zoom:50%;" />

<img src="/images/posts/oracle-sqli-setup/7.jpg" alt="7" style="zoom:50%;" />

## 0x04 SQL注入环境

```html
2.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Query</title>
</head>
<body>
  <h1>User Query</h1>
  <form action="query.php" method="post">
    Enter User ID: <input type="text" name="user_id" required>
    <input type="submit" value="Query">
  </form>
</body>
</html>
```

```php
query.php

<?php
// 获取用户输入的 ID
$user_id = $_POST['user_id'];

// 连接到 Oracle 数据库
$conn = oci_connect('pentest', 'pentest', '//10.1.239.138:1521/xe');

// 查询用户信息
$query = "SELECT * FROM users WHERE id = $user_id";
$stid = oci_parse($conn, $query);
oci_execute($stid);

// 显示查询结果
while ($row = oci_fetch_assoc($stid)) {
    echo "User ID: " . $row['USER_ID'] . "<br>";
    echo "Name: " . $row['NAME'] . "<br>";
    echo "SURNAME: " . $row['SURNAME'] . "<br>";
    // 添加其他用户信息字段
}

// 关闭连接
oci_free_statement($stid);
oci_close($conn);
?>
```

<img src="/images/posts/oracle-sqli-setup/8.jpg" alt="8" style="zoom:50%;" />

```bash
# 如果访问2.html显示403错误，原因可能是文件权限没有设置可读
chmod 644 2.html
root@6ae0e91be12e:/var/www/html# ls -l
total 20
-rw-r--r-- 1 root root    4 Dec 12 07:50 1.html
-rw-r--r-- 1 root root 1240 Dec 12 08:25 1.php
-rw-r--r-- 1 1000 1000  389 Dec 12 07:46 2.html
-rw-r--r-- 1 1000 1000  628 Dec 12 08:33 query.php
-rw-r--r-- 1 root root  292 Dec 12 09:05 test.php
```

<img src="/images/posts/oracle-sqli-setup/9.jpg" alt="9" style="zoom:50%;" />

```bash
输入user_id = 1 or 1=1 时显示所有数据
```

<img src="/images/posts/oracle-sqli-setup/10.jpg" alt="10" style="zoom:50%;" />

```assembly
sqlmap

# 所有数据库
python3 sqlmap.py -r 1.txt -dbs
```

![](/images/posts/oracle-sqli-setup/11.jpg)

```sql
select * from USERS where id = 1 UNION ALL SELECT NULL,CHR(113)||CHR(107)||CHR(106)||CHR(113)||CHR(113)||CHR(99)||CHR(84)||CHR(90)||CHR(117)||CHR(89)||CHR(104)||CHR(71)||CHR(89)||CHR(100)||CHR(115)||CHR(81)||CHR(115)||CHR(73)||CHR(110)||CHR(111)||CHR(70)||CHR(81)||CHR(102)||CHR(101)||CHR(66)||CHR(65)||CHR(83)||CHR(84)||CHR(110)||CHR(121)||CHR(105)||CHR(85)||CHR(121)||CHR(75)||CHR(78)||CHR(74)||CHR(116)||CHR(66)||CHR(80)||CHR(111)||CHR(100)||CHR(70)||CHR(105)||CHR(79)||CHR(80)||CHR(113)||CHR(112)||CHR(113)||CHR(98)||CHR(113),NULL FROM DUAL-- YGEl
```

![](/images/posts/oracle-sqli-setup/12.jpg)

![](/images/posts/oracle-sqli-setup/13.jpg)

在`Navicat`中为10秒

```sql
select * from USERS where id = 1 AND 2228=DBMS_PIPE.RECEIVE_MESSAGE(CHR(116)||CHR(102)||CHR(67)||CHR(65),5)
```

![](/images/posts/oracle-sqli-setup/14.jpg)

## 0x05 小结

```bash
# 启动 Oracle
docker run -it -d -p 8080:8080 -p 1521:1521 sath89/oracle-12c

# 启动 php
docker run -p 8090:80 -d -v /Users/hua/docker/sample:/var/www/html thomasbisignani/docker-apache-php-oracle

# 进入 Oracle 容器里面
docker exec -it cranky_greider /bin/bash
# 以 pentest身份 进入 Oracle 命令行
$ORACLE_HOME/bin/sqlplus pentest/pentest

# 浏览器访问
本机 ip:8090
```

# PS：使用Navicat连接Oracle

```assembly
映射出来的是1521端口，为Oracle数据库的连接端口
```

## 1、连接时出现 cannot create oci handles

因为所使用的`oci.dll`的环境与服务器的`Oracle`版本不符。

![](/images/posts/oracle-sqli-setup/15.jpg)

我这里的版本是`12.1.0`，去`Navicat`目录下查看版本，我这里已经修改过了，之前是`11.1.0`。

![](/images/posts/oracle-sqli-setup/16.jpg)

可以去`Oracle`官网下载对应版本。

```
https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html
```

<img src="/images/posts/oracle-sqli-setup/17.jpg" alt="17" style="zoom: 33%;" />

<img src="/images/posts/oracle-sqli-setup/18.jpg" alt="18" style="zoom:33%;" />

解压后将文件夹放在`Navicat`根目录下即可，然后引用这个版本的`oci.dll`环境，保存重启即可。

<img src="/images/posts/oracle-sqli-setup/19.jpg" alt="19" style="zoom:50%;" />

## 2、连接时出现 ORA-12514:TNS:listener does not currently know of service requested in connect descriptor

这里是由于使用的服务名对应不上，`Navicat`连接`Oracle`的默认服务名为`ORCL`。

- 使用Oracle身份进入sql界面`sqlplus / as sysdba`
- 执行`show parameter names`，显示的`service_names`对应的`values`就是`navicat`对应的服务名

<img src="/images/posts/oracle-sqli-setup/20.jpg" alt="20" style="zoom:50%;" />

<img src="/images/posts/oracle-sqli-setup/21.jpg" alt="21" style="zoom: 50%;" />

连接成功。

## 