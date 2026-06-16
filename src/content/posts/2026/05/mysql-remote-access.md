---
title: MySQL 开启远程访问
published: 2026-05-19 10:02
tags: [数据库]
category: 工具
draft: false
---

MySQL 初次安装后默认只允许 `localhost` 登录，需要手动配置才能从其他主机远程连接。

## 1. 本地登录

```bash
mysql -u root -p
```

## 2. 授权远程访问

### MySQL 8.0 之前

```sql
-- 允许 root 从任何主机连接
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;

-- 允许 root 从特定主机连接
GRANT ALL PRIVILEGES ON *.* TO 'root'@'192.168.1.100' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
```

### MySQL 8.0 及以上

MySQL 8 之后不再支持 `GRANT ... IDENTIFIED BY` 语法，需要先创建用户再授权：

```sql
-- 先创建用户
CREATE USER 'root'@'%' IDENTIFIED BY 'your_password';

-- 再授权
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## 3. secure_file_priv 配置

`secure_file_priv` 控制 `LOAD DATA INFILE` / `SELECT INTO OUTFILE` 的读写目录：

```sql
-- 查看当前配置
SHOW VARIABLES LIKE '%secure%';
-- 或
SELECT @@secure_file_priv;
```

- 值为空字符串 `""`：允许任意目录读写
- 值为路径（如 `/var/lib/mysql-files/`）：仅允许该目录
- 值为 `NULL`：禁止文件读写操作

如需修改，在 `my.ini`（Windows）或 `my.cnf`（Linux）中添加：

```ini
[mysqld]
secure_file_priv=""
```

修改后重启 MySQL 生效。

## 4. 防火墙放行端口

不要忘记放行 MySQL 默认端口 `3306`：

```bash
# Linux (firewalld)
firewall-cmd --add-port=3306/tcp --permanent
firewall-cmd --reload

# Linux (iptables)
iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
```
