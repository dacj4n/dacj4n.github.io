---
title: RSA原理
published: 2023-09-03 02:58
tags: [安全, RSA, 密码学, 非对称加密]
category: CTF
draft: false
---

# RSA原理

## 1、选择一对不相等且足够大的质数

```assembly
p、q
```

## 2、计算 p，q 的乘积

```assembly
n = p * q
```

## 3、计算 n 的欧拉函数

```assembly
φ(n) = (p - 1) * (q - 1)
```

## 4、选一个与 φ(n) 互质的整数 e

```assembly
1 < e < φ(n)
```

## 5、计算出 e 对于 φ(n) 的模反元素 d

```assembly
d * e mod φ(n) = 1
```

## 6、公钥

```assembly
KU = (e, n)
```

## 7、私钥

```assembly
KR = (d, n)
```

| 步骤 |              说明               |           描述           |
| :--: | :-----------------------------: | :----------------------: |
|  1   |  选择一对不相等且足够大的质数   |           p、q           |
|  2   |        计算 p，q 的乘积         |        n = p * q         |
|  3   |        计算 n 的欧拉函数        | φ(n) = (p - 1) * (q - 1) |
|  4   |   选一个与 φ(n) 互质的整数 e    |      x 1 < e < φ(n)      |
|  5   | 计算出 e 对于 φ(n) 的模反元素 d |    d * e mod φ(n) = 1    |
|  6   |              公钥               |       KU = (e, n)        |
|  7   |              私钥               |       KR = (d, n)        |

## 加密流程

```assembly
明文 M	加密 M^e mod n = C
密文 C	解密 C^d mod n = M
```

## 例题

```assembly
p = 3
q = 11
n = 3 * 11 = 33
φ(n) = (3 - 1) * (11 - 1) = 20
```

```assembly
与 φ(n) 互质的整数 1 < e < φ(n)
e = 3
```

```assembly
e 对于 φ(n) 的模反元素 d
d * 3 mod φ(n) = 1
d * 3 mod 20 = 1
d = 7
```

```assembly
加密 M = 20
KU = (3, 33)
密文 C = 20^3 mod 33 = 14
```

```assembly
解密 C = 14
KR = (7, 33)
明文 M = 14^7 mod 33 = 20
```

## 代码

```python
import gmpy2


p = 3
q = 11
n = p * q
phi_n = (p - 1) * (q - 1)	# φ(n)
e = 3

d = gmpy2.invert(e, phi_n)
c = 14
m = pow(c, d, n)
print m			# m = 20
```

## 欧拉函数φ(n)

```
欧拉函数φ(n)的定义是小于n的自然数中与n互质的数的个数
```



## 欧拉定理

```
若n,a为正整数，且n,a互质，则:a^φ(n)≡1 mod n
```

## 费马小定理

![费马小定理](/images/posts/rsa-principle/费马小定理.jpg)

## 模运算

模运算与基本四则运算有些相似，但是除法除外。其规则如下：

```
(a + b) % p = (a % p + b % p) % p
(a - b) % p = (a % p - b % p) % p
(a * b) % p = (a % p * b % p) % p
a ^ b % p = ((a % p) ^ b) % p
结合律
((a + b) % p + c) = (a + (b + c) % p) % p
((a * b) % p * c) = (a * (b * c) % p) % p
交换律
(a + b) % p = (b + a) % p
(a * b) % p = (b * a) % p
分配律
(a + b) % p = (a % p + b % p) % p
((a + b) % p * c) % p = ((a * c) % p + (b * c) % p
重要定理
若 a ≡ b (mod p)，则对于任意的 c，都有(a + c) ≡ (b + c) (mod p)
若 a ≡ b (mod p)，则对于任意的 c，都有(a * c) ≡ (b * c) (mod p)
若 a ≡ b (mod p)，c ≡ d (mod p)，则
(a + c) ≡ (b + d) (mod p)
(a - c) ≡ (b - d) (mod p)
(a * c) ≡ (b * d) (mod p)
(a / c) ≡ (b / d) (mod p)
```

```
逆元
a mod p的逆元便是可以使 a * a' mod p = 1 的最小a'
```

## 推导过程

```assembly
式1：c = m ^ e % N
式2：m = c ^ d % N
```


将式1带入式2 得 m = (m ^ e % N ) ^ d % N

需要证明：m == ( m ^ e % N ) ^ d % N

```assembly
(m ^ e % N) ^ d % N

=>  (m ^ e) ^ d % N          #模运算 a ^ b % p = ((a % p) ^ b) % p

m ^ (e * d) % N              #幂的乘方，底数不变，指数相乘
```


将 e * d ≡ 1 (mod φ(N)) 即 e * d = K * φ(N) + 1，K为任意正整数，代入得：

```assembly
=> (m ^ (K * φ(N) + 1)) % N

=> (m ^ (K * φ(N) * m ^ 1) % N      # 同底数相乘，指数相加

=> (m ^ (K * φ(N) * m) % N

=> ((m ^ φ(N) ^ K % N * m) % N      # 幂的乘方，底数不变，指数相乘

=> ((m ^ φ(N) ^ K % N * m % N) % N           # (a * b) % p = (a % p * b % p) % p

=> ((m ^ φ(N) % N) ^ K % N * m % N) % N      # a ^ b % p = ((a % p) ^ b) % p

=> (1 ^ K % N * m % N) % N                   # 根据欧拉定理：a ^ φ(n) ≡ 1 mod n 即 a ^ φ(n) mod n = 1

=> (m % N) % N                               # 1 ^ K % N = 1

=> (m % N) % N

=> (m % N) ^ 1 % N

=> (m ^ 1) % N                               # a ^ b % p = ((a % p) ^ b) % p

=> m % N

m               # 因为 m < N
```