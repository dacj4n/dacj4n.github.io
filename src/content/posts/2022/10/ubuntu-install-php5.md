---
title: Ubuntu安装低版本php
published: 2022-10-10 16:40
category: 系统
draft: false
tags: [Ubuntu, PHP, 运维]
---

## 一、前言

2021 年开始，Ubuntu 官方不再支持 PHP 5.6 版本的维护和更新，因此如果需要在 Ubuntu 上安装 PHP 5.6，则需要使用第三方的 PPA（个人软件包归档）来进行安装。

## 二、安装步骤

### 1. 添加paa仓库

```php
add-apt-repository ppa:ondrej/php
```

说明：上述命令是用于将第三方软件包仓库添加到 Ubuntu 系统的命令。这个特定的命令表示要添加 ondrej/php PPA（Personal Package Archive）。

PPA 是 Ubuntu 中用于存储个人或团队维护的软件包的仓库。通过添加 PPA，你可以轻松地访问和安装这些软件包，而不必手动下载和编译源代码。

在这种情况下，ondrej/php PPA 是由 Ondřej Surý 维护的一个 PHP 软件包仓库。它提供了较新版本的 PHP 和相关的扩展、工具等，可以在 Ubuntu 系统上使用。

### 2. 更新源并升级系统

```sh
sudo apt update 
sudo apt upgrade  ————可以不执行
```

### 3. 安装 PHP 5.6

```sh
sudo apt install php5.6
```

### 4. 安装PHP常用扩展

```sh
sudo apt install php5.6 php5.6-fpm php5.6-mysql php5.6-gd php5.6-mbstring php5.6-curl php5.6-soap php5.6-redis php5.6-xml php5.6-apcu php5.6-mcrypt -y
```

## 三、php-fpm扩展

### 简介

```
PHP-FPM（PHP FastCGI 进程管理器）是一个用于管理 PHP FastCGI 进程的解决方案。它是 PHP 官方提供的一种替代 PHP-CGI（Common Gateway Interface）的方法，用于在 Web 服务器上执行 PHP 脚本。
```

### PHP-FPM 的主要功能

```
（1）支持并发请求：PHP-FPM 支持并发处理多个请求，能够更高效地处理大量的并发请求。

（2）进程管理：PHP-FPM 可以独立地管理 PHP 进程，根据配置文件中的设置来启动、停止、重启和控制 PHP 进程的数量。

（3）进程池：PHP-FPM 使用进程池来处理请求，每个进程都可以独立地处理一个请求。进程池可以根据负载情况自动调整进程数量，并且可以为不同的虚拟主机或应用程序分配不同的进程池。

（4）资源限制：PHP-FPM 允许您为每个进程设置资源限制，如内存限制和执行时间限制，这有助于保护服务器免受资源滥用。

（5）日志记录：PHP-FPM 提供了详细的日志记录功能，可以记录每个请求的处理情况，便于故障排除和性能优化。
```

### 作用：与nginx结合使用

```
通过将 Nginx（或其他 Web 服务器）与 PHP-FPM 结合使用，可以实现高性能和可扩展的 PHP Web 应用程序环境。Nginx 作为前端 Web 服务器接收和处理 HTTP 请求，然后将 PHP 请求转发给 PHP-FPM 进程进行处理，并将处理结果返回给客户端。这种结构可以提供更高的性能和可靠性，同时允许灵活地配置和管理 PHP 进程。
```

### PHP-FPM常用命令

```
根据你安装PHP时安装FPM扩展的有关，比如之前我安装的是php5.6-fpm
```

```sh
systemctl status php5.6-fpm
```

```sh
# 启停状态
systemctl start php5.6-fpm
systemctl stop php5.6-fpm
systemctl restart php5.6-fpm
systemctl restart php5.6-fpm

# 开机自启/禁用
systemctl enable php5.6-fpm
systemctl disable php5.6-fpm
```

### 卸载PHP

```sh
sudo apt-get purge php5.6
```

### 删除PHP相关的配置文件

```sh
sudo apt-get purge php5.6-common
```

### 删除PHP的扩展文件

```sh
# 先输入以下命令来查看已安装的 PHP 扩展列表
dpkg -l | grep php5.6
```

```sh
# 对于每个要卸载的扩展，使用以下命令进行卸载。以 mysql 扩展为例：
apt-get purge php5.6-mysql
```

## PS：php无法和apache2联动

### 使用 PHP 模块方式

```sh
# 确保 PHP 模块已启用
sudo a2enmod php5.6

# 重启 Apache
sudo systemctl restart apache2
```

### 在 VirtualHost 中显式配置 PHP

编辑配置文件：

```sh
sudo nano /etc/apache2/sites-available/000-default.conf
```

在 `</VirtualHost>` 前添加以下内容：

```apache
    # PHP configuration
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
    
    # Directory configuration for /var/www/html
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
```

完整配置应该类似：

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

    # PHP configuration
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
    
    # Directory configuration
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 检查并创建测试文件

```sh
# 创建 PHP 测试文件
sudo tee /var/www/html/test.php << 'EOF'
<?php
echo "PHP is working!";
phpinfo();
?>
EOF

# 设置正确的权限
sudo chown www-data:www-data /var/www/html/test.php
sudo chmod 644 /var/www/html/test.php
```

### 验证配置并重启

```sh
# 检查 Apache 配置语法
sudo apache2ctl configtest

# 重启 Apache
sudo systemctl restart apache2

# 测试 PHP
curl http://localhost/test.php
```
