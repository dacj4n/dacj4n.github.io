---
title: john解密
published: 2022-04-15 10:35
category: 工具
draft: false
tags: [John, 密码破解, Linux]
---

## md5

```bash
echo "e10adc3949ba59abbe56e057f20f883e:" > hash1.txt
```

```bash
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash1.txt
Using default input encoding: UTF-8
Loaded 1 password hash (Raw-MD5 [MD5 256/256 AVX2 8x3])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
123456           (?)     
1g 0:00:00:00 DONE (2024-11-01 21:16) 100.0g/s 38400p/s 38400c/s 38400C/s 123456..michael1
Use the "--show --format=Raw-MD5" options to display all of the cracked passwords reliably
Session completed.
```

## 压缩包

```bash
┌──(root㉿kali)-[/home/dcj/Desktop]
└─# zip2john secret.zip > hash
ver 2.0 secret.zip/123.txt PKZIP Encr: TS_chk, cmplen=20, decmplen=6, crc=309273C2 ts=AA74 cs=aa74 type=8
                                                                                     
┌──(root㉿kali)-[/home/dcj/Desktop]
└─# cat hash             
secret.zip/123.txt:$pkzip$1*1*2*0*14*6*309273c2*0*25*8*14*aa74*05cb713965ada65631a7692c23c25de72e0386d8*$/pkzip$:123.txt:secret.zip::secret.zip
                                                                                     
┌──(root㉿kali)-[/home/dcj/Desktop]
└─# john hash
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 4 OpenMP threads
Proceeding with single, rules:Single
Press 'q' or Ctrl-C to abort, almost any other key for status
Almost done: Processing the remaining buffered candidate passwords, if any.
Proceeding with wordlist:/usr/share/john/password.lst
123456           (secret.zip/123.txt)     
1g 0:00:00:00 DONE 2/3 (2024-11-01 21:21) 33.33g/s 1319Kp/s 1319Kc/s 1319KC/s 123456..ferrises
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

## 密码类型

```
https://hashcat.net/wiki/doku.php?id=example%20hashes
```
