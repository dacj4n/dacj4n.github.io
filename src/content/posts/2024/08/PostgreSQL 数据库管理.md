---
title: PostgreSQL 数据库管理
published: 2024-08-12 17:23
tags: [数据库]
category: 工具
draft: false
---



# PostgreSQL 数据库管理

```
https://www.sjkjc.com/postgresql/administration/
```



## 0x01 PostgreSQL psql 命令

本文介绍了在 PostgreSQL 提供的 psql 工具中的常用的命令。

psql 工具是 PostgreSQL 提供的一个客户端程序。您能使用 psql 工具管理 PostgreSQL 数据库服务器。 本文整理了常用的 psql 命令，以便您能够更加有效的管理 PostgreSQL 数据库服务器。

### 连接 PostgreSQL

要使用 psql 工具管理 PostgreSQL 服务器，请先连接到 PostgreSQL 服务器。 命令如下：

```sql
psql -d dbname -U  user -W
```

如果您需要连接一个远程的 PostgreSQL 服务器，请使用如下命令：

```sql
psql -h host -p port -d dbname -U  user -W
```

其中：

- `-h` 参数用于指定远程 PostgreSQL 服务器的主机名或者 IP 地址。 默认值为 `localhost`。
- `-p` 参数用于指定远程 PostgreSQL 服务器的端口号。默认值为 5432。

### psql 常用命令

当您使用 psql 登录进 PostgreSQL 服务器以后，您就可以使用下面的命令管理服务器了。

#### 列出所有的数据库

要列出当前 PostgreSQL 数据库服务器中的[所有数据库](https://www.sjkjc.com/postgresql/show-databases/)，请使用 `\l` 或者 `\l+` 命令：

```sql
\l
```

或者

```sql
\l+
```

#### 连接到数据库

连接数据库请使用 `\c` 或者 `\connect` 命令。

要使用当前用户连接到新的数据库，请使用如下命令：

```sql
\c dbname
```

要使用新的用户连接到当前数据库，请使用如下命令：

```sql
\c - username
```

您可以是用 `\connect` 替换上面命令中的 `\c`，他们是等效的。

#### 列出数据库中的表

要[列出当前数据库中的表](https://www.sjkjc.com/postgresql/show-tables/)，请使用 `\dt` 或者 `\dt+` 命令：

```sql
\dt
```

或者

```sql
\dt+
```

#### 显示表结构

要显示一个表的结构或定义，比如 列，约束等信息，请使用 `\d` 命令：

```sql
\d table_name
```

比如，要查看 `product` 表的结构，请使用如下命令：

```sql
\d product
```

```txt
testdb=# \d product
                                 Table "public.product"
    Column    |       Type        | Collation | Nullable |           Default
--------------+-------------------+-----------+----------+------------------------------
 id           | integer           |           | not null | generated always as identity
 product_name | character varying |           | not null |
 attributes   | hstore            |           |          |
Indexes:
    "product_pkey" PRIMARY KEY, btree (id)
```

#### 列出可用模式

要列出当前连接的数据库的所有模式，请使用该 `\dn` 命令。

```sql
\dn
```

```txt
  List of schemas
  Name  |  Owner
--------+----------
 public | postgres
```

#### 列出可用的函数

要列出当前数据库中的可用函数，请使用该 `\df` 命令。

```sql
\df
```

```txt
                                                    List of functions
 Schema |           Name           |  Result data type  |                   Argument data types                   | Type
--------+--------------------------+--------------------+---------------------------------------------------------+------
 public | akeys                    | text[]             | hstore                                                  | func
 public | avals                    | text[]             | hstore                                                  | func
 public | defined                  | boolean            | hstore, text                                            | func
 public | delete                   | hstore             | hstore, hstore                                          | func
 public | delete                   | hstore             | hstore, text                                            | func
 public | delete                   | hstore             | hstore, text[]                                          | func
 public | each                     | SETOF record       | hs hstore, OUT key text, OUT value text                 | func
 public | exist                    | boolean            | hstore, text                                            | func
 public | exists_all               | boolean            | hstore, text[]                                          | func
 public | exists_any               | boolean            | hstore, text[]                                          | func
 public | fetchval                 | text               | hstore, text                                            | func
 public | ghstore_compress         | internal           | internal                                                | func
 public | ghstore_consistent       | boolean            | internal, hstore, smallint, oid, internal               | func
 public | ghstore_decompress       | internal           | internal                                                | func
 public | ghstore_in               | ghstore            | cstring                                                 | func
 public | ghstore_options          | void               | internal                                                | func
 public | ghstore_out              | cstring            | ghstore                                                 | func
 public | ghstore_penalty          | internal           | internal, internal, internal                            | func
 public | ghstore_picksplit        | internal           | internal, internal                                      | func
 public | ghstore_same             | internal           | ghstore, ghstore, internal                              | func
 public | ghstore_union            | ghstore            | internal, internal                                      | func
 public | gin_consistent_hstore    | boolean            | internal, smallint, hstore, integer, internal, internal | func
 public | gin_extract_hstore       | internal           | hstore, internal                                        | func
 public | gin_extract_hstore_query | internal           | hstore, internal, smallint, internal, internal          | func
 public | hs_concat                | hstore             | hstore, hstore                                          | func
 public | hs_contained             | boolean            | hstore, hstore                                          | func
 public | hs_contains              | boolean            | hstore, hstore                                          | func
 public | hstore                   | hstore             | record                                                  | func
 public | hstore                   | hstore             | text, text                                              | func
 public | hstore                   | hstore             | text[]                                                  | func
 public | hstore                   | hstore             | text[], text[]                                          | func
 public | hstore_cmp               | integer            | hstore, hstore                                          | func
 public | hstore_eq                | boolean            | hstore, hstore                                          | func
 public | hstore_ge                | boolean            | hstore, hstore                                          | func
 public | hstore_gt                | boolean            | hstore, hstore                                          | func
 public | hstore_hash              | integer            | hstore                                                  | func
 public | hstore_hash_extended     | bigint             | hstore, bigint                                          | func
 public | hstore_in                | hstore             | cstring                                                 | func
 public | hstore_le                | boolean            | hstore, hstore                                          | func
 public | hstore_lt                | boolean            | hstore, hstore                                          | func
 public | hstore_ne                | boolean            | hstore, hstore                                          | func
 public | hstore_out               | cstring            | hstore                                                  | func
 public | hstore_recv              | hstore             | internal                                                | func
 public | hstore_send              | bytea              | hstore                                                  | func
 public | hstore_subscript_handler | internal           | internal                                                | func
 public | hstore_to_array          | text[]             | hstore                                                  | func
 public | hstore_to_json           | json               | hstore                                                  | func
 public | hstore_to_json_loose     | json               | hstore                                                  | func
 public | hstore_to_jsonb          | jsonb              | hstore                                                  | func
 public | hstore_to_jsonb_loose    | jsonb              | hstore                                                  | func
 public | hstore_to_matrix         | text[]             | hstore                                                  | func
 public | hstore_version_diag      | integer            | hstore                                                  | func
 public | isdefined                | boolean            | hstore, text                                            | func
 public | isexists                 | boolean            | hstore, text                                            | func
 public | my_time_multirange       | my_time_multirange |                                                         | func
 public | my_time_multirange       | my_time_multirange | VARIADIC my_time_range[]                                | func
 public | my_time_multirange       | my_time_multirange | my_time_range                                           | func
 public | my_time_range            | my_time_range      | time without time zone, time without time zone          | func
 public | my_time_range            | my_time_range      | time without time zone, time without time zone, text    | func
 public | populate_record          | anyelement         | anyelement, hstore                                      | func
 public | skeys                    | SETOF text         | hstore                                                  | func
 public | slice                    | hstore             | hstore, text[]                                          | func
 public | slice_array              | text[]             | hstore, text[]                                          | func
 public | svals                    | SETOF text         | hstore                                                  | func
 public | tconvert                 | hstore             | text, text                                              | func
(65 rows)
```

#### 列出可用视图

要列出当前数据库中的可用视图，请使用该 `\dv` 命令。

```sql
\dv
```

#### 列出用户及其角色

要列出所有用户及其分配的角色，请使用 `\du` 命令：

```sql
\du
```

```txt
                                   List of roles
 Role name |                         Attributes                         | Member of
-----------+------------------------------------------------------------+-----------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}
```

#### 开启查询执行时间

要打开查询执行时间，请使用该 `\timing` 命令。

```sql
\timing
select * from product;
```

```txt
 id | product_name |                          attributes
----+--------------+--------------------------------------------------------------
  2 | Shirt B      | "Color"=>"White", "Style"=>"Business", "Season"=>"Spring"
  1 | Computer A   | "CPU"=>"2.5", "Disk"=>"1T", "Brand"=>"Dell", "Memory"=>"16G"
(2 rows)

Time: 0.281 ms
```

当您再次运行 `\timing` 命令，则会关闭查询执行时间。

#### 查看命令历史

要显示命令历史记录，请使用该 `\s` 命令。

```sql
\s
```

如果要将命令历史保存到文件中，则需要在 `\s` 命令后指定文件名 ，如下所示：

```sql
\s filename
```

#### 执行上一条命令

要想执行最近的一条命令， 请使用 `\g` 命令:

```sql
\g
```

`\g` 可让你避免重新输入上一条命令。

#### 获取 SQL 命令的帮助

要获取 SQL 命令的说明，请使用 `\h` 命令，如下：

```sql
\h sql_command
```

比如，要获取 `TRUNCATE` 的帮助说明，请使用如下的命令：

```sql
\h TRUNCATE
```

```txt
Command:     TRUNCATE
Description: empty a table or set of tables
Syntax:
TRUNCATE [ TABLE ] [ ONLY ] name [ * ] [, ... ]
    [ RESTART IDENTITY | CONTINUE IDENTITY ] [ CASCADE | RESTRICT ]

URL: https://www.postgresql.org/docs/14/sql-truncate.html
```

#### 获取 psql 的帮助

要了解 psql 命令的详细用法，请使用 `\?` 命令

```sql
\?
```

#### 从文件中执行 psql 命令

如果要从文件执行 psql 命令，请 `\i` 按如下方式使用命令：

```sql
\i filename
```

#### 打开扩展显示

要为 [`SELECT` 语句](https://www.sjkjc.com/postgresql/select/)的结果集打开扩展显示，请使用 `\x` 命令。

```sql
\x
select * from product;
```

```txt
-[ RECORD 1 ]+-------------------------------------------------------------
id           | 2
product_name | Shirt B
attributes   | "Color"=>"White", "Style"=>"Business", "Season"=>"Spring"
-[ RECORD 2 ]+-------------------------------------------------------------
id           | 1
product_name | Computer A
attributes   | "CPU"=>"2.5", "Disk"=>"1T", "Brand"=>"Dell", "Memory"=>"16G"
```

扩展显示对于显示那些很长的列很有帮助。

如果您再次运行 `\x` 命令。则回关闭扩展显示。

#### 退出 psql

要退出 psql，您可以使用 `\q` 命令并按下 `enter` 退出 psql。

```sql
\q
```

### 结论

本文向您展示了 psql 工具的常用的命令。



## 0x02 PostgreSQL 列出数据库

```sql
1.查询当前数据库：

终端：\c

sql语句：select current_database();

2.查询当前用户：

终端：\c

sql语句：select user;  或者：select current_user;
```

本文介绍了在 PostgreSQL 列出数据库的两种方法。

PostgreSQL 提供了两种方法列出 PostgreSQL 服务器中的所有数据库：

- 在 `psql` 工具中使用 `\l` 或者 `\l+` 列出所有的数据库。
- 从 `pg_database` 表中查询所有的数据库。

### 使用 `\l` 列出数据库

本实例演示了使用 `psql` 工具登录数据库并列出数据库的步骤。请按照如下步骤进行：

1. 使用 postgres 用户登录 PostgreSQL 服务器：

   ```bash
   [~] psql -U postgres
   psql (14.4)
   Type "help" for help.
   ```

   注意：您也可以使用其他任何具有相应的数据库权限的用户登录。

2. 使用 `\l` 命令列出所有的数据库，如下：

   ```sql
   \l
   ```

   ```txt
                                 List of databases
     Name    |  Owner   | Encoding | Collate |  Ctype  |   Access privileges
   -----------+----------+----------+---------+---------+-----------------------
   postgres  | postgres | UTF8     | C.UTF-8 | C.UTF-8 |
   template0 | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
             |          |          |         |         | postgres=CTc/postgres
   template1 | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +
             |          |          |         |         | postgres=CTc/postgres
   testdb    | postgres | UTF8     | C.UTF-8 | C.UTF-8 |
   testdb2   | postgres | UTF8     | C.UTF-8 | C.UTF-8 |
   (5 rows)
   ```

3. 如果要查看更多关于数据库的信息，请使用 `\l+` 命令，如下：

   ```fallback
   \l+
   ```

   ```txt
                                                                   List of databases
     Name    |  Owner   | Encoding | Collate |  Ctype  |   Access privileges   |  Size   | Tablespace |                Description
   -----------+----------+----------+---------+---------+-----------------------+---------+------------+--------------------------------------------
   postgres  | postgres | UTF8     | C.UTF-8 | C.UTF-8 |                       | 8529 kB | pg_default | default administrative connection database
   template0 | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +| 8377 kB | pg_default | unmodifiable empty database
             |          |          |         |         | postgres=CTc/postgres |         |            |
   template1 | postgres | UTF8     | C.UTF-8 | C.UTF-8 | =c/postgres          +| 8529 kB | pg_default | default template for new databases
             |          |          |         |         | postgres=CTc/postgres |         |            |
   testdb    | postgres | UTF8     | C.UTF-8 | C.UTF-8 |                       | 8897 kB | pg_default |
   testdb2   | postgres | UTF8     | C.UTF-8 | C.UTF-8 |                       | 8545 kB | pg_default |
   (5 rows)
   ```

您可以看到， `\l+` 的输出比 `\l` 多了 `Size`, `Tablespace` 和 `Description` 列。

#### 从 `pg_database` 表中查询数据库

除了上面的 `\l+` 和 `\l` 命令，您还可以从 `pg_database` 表中查询所有的数据库。

`pg_database` 表是 PostgreSQL 内置的一个表，它存储了所有的数据库。

```sql
SELECT datname FROM pg_database;
```

```txt
  datname
-----------
 postgres
 testdb
 template1
 template0
 testdb2
(5 rows)
```

### 结论

PostgreSQL 提供了两种方法列出 PostgreSQL 服务器中的所有的数据库中：

- 在 `psql` 工具中使用 `\l` 或者 `\l+` 列出当所有的数据库。
- 从 `pg_database` 表中查询所有的数据库。

在 MySQL 中，您可以使用 [`SHOW DATABASES`](https://www.sjkjc.com/mysql/show-databases/) 命令列出数据库。



## 0x03 PostgreSQL 复制数据库

本文介绍了在 PostgreSQL 中复制数据库的几种方法

在 PostgreSQL 中，您可以使用以下几种方法复制数据库：

1. 使用 [`CREATE DATABASE`](https://www.sjkjc.com/postgresql/create-database/) 从模板数据库复制一个数据库。此方法仅适用于在同一个 PostgreSQL 服务器内操作。
2. [备份一个现有的数据库](https://www.sjkjc.com/postgresql/backup-and-restore/)，并将其恢复到一个新的数据库。

### 从模板数据库复制数据库

有时候，为了数据的安全性，您在操作之前需要先将要操作数据库复制备份。 您可以使用 `CREATE DATABASE` 将此数据库复制为一个新数据库，如下：

```sql
CREATE DATABASE new_db
WITH TEMPLATE old_db;
```

此语句将 复制 `old_db` 数据库到 `new_db` 数据库。 `old_db` 必须是模板数据库才能被复制。如果它不是模板数据库，您可以使用 `ALTER DATABASE` 语句[将此数据库修改为模板数据库](https://www.sjkjc.com/postgresql/alter-database/)，如下：

```sql
ALTER DATABASE old_db WITH IS_TEMPLATE true;
```

此方法仅能用在同一个 PostgreSQL 数据库服务器内。如果您想在不同的 PostgreSQL 数据库服务器间复制数据库，请查看 [PostgreSQL 备份和恢复教程](https://www.sjkjc.com/postgresql/backup-and-restore/)。

### 结论

PostgreSQL 允许您使用 `CREATE DATABASE` 语句复制一个模板数据库。



## 0x04 PostgreSQL 查看空间

本文介绍了在 PostgreSQL 如何查看数据库、表、索引和表空间的大小。

作为数据库管理者，您经常需要查看数据库的占用空间，这包括 数据库、表、索引和表空间的大小，以便为他们分配合理的存储空间。

### PostgreSQL 数据库大小

您可以使用 `pg_database_size()` 函数获取整个数据库的大小。例如，以下语句返回 `testdb` 数据库的大小：

```postgres
SELECT pg_database_size('testdb');
```

```txt
 pg_database_size
------------------
          9044483
```

`pg_database_size()` 函数以字节为单位返回数据库的大小，这不容易阅读。您可以使用 `pg_size_pretty()` 函数将字节转为更易于阅读值。如下：

```postgres
SELECT
  pg_size_pretty(
    pg_database_size('testdb')
  );
```

该语句返回以下结果：

```txt
 pg_size_pretty
----------------
 8833 kB
```

如果您想要要获取当前数据库服务器中[所有数据库](https://www.sjkjc.com/postgresql/show-databases/)的大小，请使用以下语句：

```sql
SELECT
  datname,
  pg_size_pretty(pg_database_size(datname)) AS size
  FROM pg_database;
```

```txt
   datname   |  size
-------------+---------
 postgres    | 8561 kB
 template1   | 8401 kB
 template0   | 8401 kB
 testdb      | 8833 kB
 sakila      | 16 MB
 testdb2     | 8521 kB
 test_new_db | 8401 kB
```

### PostgreSQL 表大小

您可以使用 `pg_relation_size()` 函数获取一个表的大小。例如，以下语句返回 [Sakila 示例数据库](https://www.sjkjc.com/postgresql/sample-database/)中的 `actor` 表的大小：

```sql
SELECT
  pg_size_pretty(
    pg_relation_size('actor')
  );
```

```txt
 pg_size_pretty
----------------
 16 kB
```

`pg_relation_size()` 函数返回表的数据的大小，不包含表中的索引的大小。如果要获取表的总的大小，请使用 `pg_total_relation_size()` 函数， 如下：

```sql
SELECT
  pg_size_pretty(
    pg_total_relation_size('actor')
  );
```

```txt
 pg_size_pretty
----------------
 72 kB
```

要获取数据库中所有的表的大小，您可以使用如下语句：

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('actor')) size
FROM pg_tables
WHERE schemaname = 'public';
```

```txt
      tablename       | size
----------------------+-------
 actor                | 72 kB
 film                 | 72 kB
 payment_p2007_02     | 72 kB
 payment_p2007_03     | 72 kB
 payment_p2007_04     | 72 kB
 payment_p2007_05     | 72 kB
 payment_p2007_06     | 72 kB
 payment_p2007_01     | 72 kB
 address              | 72 kB
 category             | 72 kB
 city                 | 72 kB
 country              | 72 kB
 customer             | 72 kB
 film_actor           | 72 kB
 film_category        | 72 kB
 inventory            | 72 kB
 language             | 72 kB
 rental               | 72 kB
 staff                | 72 kB
 store                | 72 kB
 payment              | 72 kB
 film_copy            | 72 kB
 city_copy            | 72 kB
 film_r               | 72 kB
 film_ranting_g_title | 72 kB
```

### PostgreSQL 索引大小

PostgreSQL `pg_indexes_size()` 函数用于获取一个指定表上的索引的大小。例如，要获取 `actor` 表的所有索引的总大小，请使用以下语句：

```sql
SELECT
  pg_size_pretty(
    pg_indexes_size('actor')
  );
```

```txt
 pg_size_pretty
----------------
 32 kB
```

### PostgreSQL 表空间大小

PostgreSQL `pg_tablespace_size()` 函数用于获取一个指定的表空间的大小。

以下语句返回 `pg_default` 表空间的大小：

```postgres
SELECT
  pg_size_pretty (
      pg_tablespace_size('pg_default')
  );
```

```txt
 pg_size_pretty
----------------
 67 MB
```

### PostgreSQL 值大小

PostgreSQL `pg_column_size()` 函数用于获取指定的值占用的空间，例如：

以下语句返回一个 `smallint` 类型的值的大小：

```sql
select pg_column_size(1::smallint);
```

```txt
 pg_column_size
----------------
              2
```

以下语句返回一个 `int` 类型的值的大小：

```sql
select pg_column_size(1::int);
```

```txt
 pg_column_size
----------------
              4
```

以下语句返回一个 `bigint` 类型的值的大小：

```sql
select pg_column_size(1::bigint);
```

```txt
 pg_column_size
----------------
              8
```

### 结论

本文讲述了几个的函数来获取数据库、表、索引、表空间和值的大小。



## 0x05 PostgreSQL 列出表

本文介绍了在 PostgreSQL 列出数据库中的表的两种方法。

PostgreSQL 提供了两种方法列出一个数据库中的所有表：

- 在 `psql` 工具中使用 `\dt` 或者 `\dt+` 列出当前当前数据库中的所有的表。
- 从 `pg_tables` 表中查询所有的表。

### 使用 `\dt` 列出数据库中的表

本实例演示了使用 `psql` 工具登录数据库并列出数据库中表的过程。请按照如下步骤进行：

1. 使用 postgres 用户登录 PostgreSQL 服务器：

   ```bash
   [~] psql -U postgres
   psql (14.4)
   Type "help" for help.
   ```

   注意：您也可以使用其他任何具有相应的数据库权限的用户登录。

2. 使用以下语句选择 `testdb` 数据库：

   ```sql
   \c testdb;
   ```

   如果还未创建数据库，请先运行如下语句：

   ```sql
   CREATE DATABASE testdb;
   ```

3. 使用 `\dt` 命令列出 `testdb` 数据库中的所有的表，如下：

   ```sql
   \dt
   ```

   ```txt
               List of relations
   Schema |      Name      | Type  |  Owner
   --------+----------------+-------+----------
   public | mytable        | table | postgres
   public | product        | table | postgres
   public | test_date      | table | postgres
   public | test_time      | table | postgres
   public | test_timestamp | table | postgres
   public | week_day_sales | table | postgres
   (6 rows)
   ```

4. 如果要查看更多关于表的信息，请使用 `\dt+` 命令，如下：

   ```sql
   \dt+
   ```

   ```txt
                                             List of relations
   Schema |      Name      | Type  |  Owner   | Persistence | Access method |    Size    | Description
   --------+----------------+-------+----------+-------------+---------------+------------+-------------
   public | mytable        | table | postgres | permanent   | heap          | 16 kB      |
   public | product        | table | postgres | permanent   | heap          | 16 kB      |
   public | test_date      | table | postgres | permanent   | heap          | 8192 bytes |
   public | test_time      | table | postgres | permanent   | heap          | 8192 bytes |
   public | test_timestamp | table | postgres | permanent   | heap          | 8192 bytes |
   public | week_day_sales | table | postgres | permanent   | heap          | 8192 bytes |
   (6 rows)
   ```

您可以看到， `\dt+` 的输入比 `\dt` 输出多了 `Persistence`, `Access method`, `Size` 和 `Description` 列。

### 从 `pg_tables` 表中查询表

除了上面的 `\dt` 和 `\dt+` 命令，您还可以从 `pg_tables` 表中查询当前数据中的所有的表。

`pg_tables` 表是 PostgreSQL 内置的一个表，它存储了数据库中的所有的表。

```sql
SELECT * FROM pg_tables
WHERE schemaname = 'public';
```

```txt
 schemaname |   tablename    | tableowner | tablespace | hasindexes | hasrules | hastriggers | rowsecurity
------------+----------------+------------+------------+------------+----------+-------------+-------------
 public     | test_date      | postgres   |            | t          | f        | f           | f
 public     | test_time      | postgres   |            | t          | f        | f           | f
 public     | test_timestamp | postgres   |            | t          | f        | f           | f
 public     | week_day_sales | postgres   |            | t          | f        | f           | f
 public     | mytable        | postgres   |            | f          | f        | f           | f
 public     | product        | postgres   |            | t          | f        | f           | f
(6 rows)
```

### 结论

PostgreSQL 提供了两种方法列出一个数据库中的所有表：

- 在 `psql` 工具中使用 `\dt` 或者 `\dt+` 列出当前数据库中的所有的表。
- 从 `pg_tables` 表中查询所有的表。

在 MySQL 中，您可以使用 [`SHOW TABLES`](https://www.sjkjc.com/mysql/show-tables/) 命令列出数据库。



## 0x06 PostgreSQL 查看表

本文介绍了在 PostgreSQL 查看数据表的定义或结构的两种方法。

PostgreSQL 提供了两种方法查看一个现有的表的定义或者结构：

- 在 `psql` 工具中使用 `\d` 或者 `\d+` 列出当前数据库中的所有的表。
- 从 `information_schema.columns` 中查询表中的列。

### 使用 `\d` 查看表的信息

本实例演示了使用 `psql` 工具登录数据库并查看表信息的详细步骤。请按照如下步骤进行：

1. 使用 postgres 用户登录 PostgreSQL 服务器：

   ```bash
   [~] psql -U postgres
   psql (14.4)
   Type "help" for help.
   ```

   注意：您也可以使用其他任何具有相应的数据库权限的用户登录。

2. 使用以下语句选择 `testdb` 数据库：

   ```sql
   \c testdb;
   ```

   如果还未创建数据库，请先运行如下语句：

   ```sql
   CREATE DATABASE testdb;
   ```

3. 以下语句使用 `\d` 命令查看 `test_date` 表的结构，如下：

   ```sql
   \d test_date
   ```

   ```txt
                           Table "public.test_date"
      Column   |  Type   | Collation | Nullable |           Default
   ------------+---------+-----------+----------+------------------------------
    id         | integer |           | not null | generated always as identity
    date_value | date    |           | not null | CURRENT_DATE
    Indexes:
       "test_date_pkey" PRIMARY KEY, btree (id)
   ```

   您可以看到，`\d` 输出了表的名字、表中的列，表中的约束等信息。

4. 如果要查看更多关于 `test_date` 表的信息，请使用 `\d+` 命令，如下：

   ```sql
   \d+ test_date
   ```

   ```txt
                                                      Table "public.test_date"
      Column   |  Type   | Collation | Nullable |           Default            | Storage | Compression | Stats target | Description
   ------------+---------+-----------+----------+------------------------------+---------+-------------+--------------+-------------
    id         | integer |           | not null | generated always as identity | plain   |             |              |
    date_value | date    |           | not null | CURRENT_DATE                 | plain   |             |              |
    Indexes:
       "test_date_pkey" PRIMARY KEY, btree (id)
    Access method: heap
   ```

   您可以看到， `\d+` 的输入比 `\d` 输出多了 `Compression`, `Stats target` 和 `Description` 列。

### 从 information_schema 中查看表中的所有列

`information_schema` 是一个系统级的 Schema, 其中提供了一些视图可以查看表、列、索引、函数等信息。

该 `information_schema.columns` 目录包含有关所有表的列的信息。

以下语句从 `information_schema.columns` 中查询 `test_date` 表的所有的列：

```sql
SELECT
   table_name,
   column_name,
   data_type,
   column_default
FROM
   information_schema.columns
WHERE
   table_name = 'test_date';
```

```txt
 table_name | column_name | data_type | column_default
------------+-------------+-----------+----------------
 test_date  | id          | integer   |
 test_date  | date_value  | date      | CURRENT_DATE
(2 rows)
```

以上语句返回了 `test_date` 表的所有的列的信息，包括 列名，数据类型，默认值。

### 结论

PostgreSQL 提供了两种方法查看一个现有的表的定义或者结构：

- 在 `psql` 工具中使用 `\d` 或者 `\d+` 列出当前当前数据库中的所有的表。
- 从 `information_schema.columns` 中查询表中的列。

在 MySQL 中，您可以使用 [`DESCRIBE`](https://www.sjkjc.com/mysql/desc-table/) 命令列出查看表中的列。



## 0x07 PostgreSQL 复制表

本文介绍了在 PostgreSQL 中复制表的几种方法

在 PostgreSQL 中，您可以使用以下几种方法复制一个表到一个新表：

1. 使用 `CREATE TABLE ... AS TABLE ...` 语句复制一个表。
2. 使用 `CREATE TABLE ... AS SELECT ...` 语句复制一个表。
3. 使用 `SELECT ... INTO ...` 语句复制一个表。

### 使用 `CREATE TABLE ... AS TABLE ...` 语句复制一个表

要将已有的 `table_name` 表复制为新表 `new_table`，包括表结构和数据，请使用以下语句：

```postgres
CREATE TABLE new_table
AS TABLE table_name;
```

如果仅复制表结构，不复制数据，请在以上 `CREATE TABLE` 语句中添加 `WITH NO DATA` 子句，如下所示：

```postgres
CREATE TABLE new_table
AS TABLE table_name
WITH NO DATA;
```

### 使用 `CREATE TABLE ... AS SELECT ...` 语句复制一个表

您还可以使用 `CREATE TABLE ... AS SELECT ...` 语句复制一个表。 这种方法可以复制部分数据到新表中。

要将已有的 `table_name` 表复制为新表 `new_table`，包括表结构和数据，请使用以下语句：

```postgres
CREATE TABLE new_table AS
SELECT * FROM table_name;
```

如果您只需要复制部分满足条件的数据，请在 [`SELECT`](https://www.sjkjc.com/postgresql/select/) 语句中添加 [`WHERE`](https://www.sjkjc.com/postgresql/where/) 子句，如下：

```postgres
CREATE TABLE new_table AS
SELECT * FROM table_name
WHERE contidion;
```

如果您只需要复制部分列到新表，请在 `SELECT` 语句中指定要复制的列的列表，如下：

```postgres
CREATE TABLE new_table AS
SELECT column1, column2, ... FROM table_name
WHERE contidion;
```

如果您只需要复制表结构，请按如下方式使用 `WHERE` 子句：

```postgres
CREATE TABLE new_table AS
SELECT * FROM table_name
WHERE 1 = 2;
```

这里在 `WHERE` 子句中使用了一个永远为假的条件。

### 使用 `SELECT ... INTO ...` 语句复制一个表

要使用 PostgreSQL `SELECT INTO` 语句将已有的 `table_name` 表复制为新表 `new_table`，请使用以下语法：

```sql
SELECT *
INTO new_table
FROM table_name
```

如果您只需要复制部分满足条件的数据，请添加 `WHERE` 子句，如下：

```sql
SELECT *
INTO new_table
FROM table_name
WHERE contidion;
```

如果您只需要复制部分列到新表，请在 `SELECT` 语句中指定要复制的列的列表，如下：

```postgres
SELECT column1, column2, ...
INTO new_table
FROM table_name
WHERE contidion;
```

### 结论

本文阐述了在 PostgreSQL 中复制表的几种方法。注意，这几种方法都只能复制列的定义和数据，都不能将索引复制过去。



## 0x08 PostgreSQL 备份和恢复

本文介绍如何使用 `pg_dump` 和 `pg_dumpall` 备份 PostgreSQL 数据库以及如何使用 `pg_restore` 恢复 PostgreSQL 数据库。

PostgreSQL 提供了 `pg_dump` 和 `pg_dumpall` 工具，帮助您轻松地备份数据库，同时，PostgreSQL 提供了 `pg_restore` 工具，帮助您轻松的恢复数据库。

作为数据库管理员，备份和恢复是必备的技能。 PostgreSQL 为我们提供了很多方便的工具或命令来做到这些。

备份数据库的工具或命令：

- `pg_dump` 工具用于备份单个 PostgreSQL 数据库
- `pg_dumpall` 工具用于备份 PostgreSQL 服务器中的所有的数据库。

恢复数据库的工具或命令：

- `pg_restore` 工具用于恢复由 `pg_dump` 工具产生的 tar 文档和目录文档。
- `psql` 工具可以导入 `pg_dump` 和 `pg_dumpall` 工具产生的 SQL 脚本文件。
- `\i` 命令可以导入 `pg_dump` 和 `pg_dumpall` 工具产生的 SQL 脚本文件。

### 使用 `pg_dump` 备份一个数据库

PostgreSQL 自带了 `pg_dump` 工具用于备份单个 PostgreSQL 数据库。 以下是一个常用的备份命令：

```sql
pg_dump -U username -W -F t db_name > output.tar
```

说明：

- `-U username`: 指定连接 PostgreSQL 数据库服务器的用户。您可以在 `username` 位置使用自己的用户名。
- `-W`: 强制 `pg_dump` 在连接到 PostgreSQL 数据库服务器之前提示输入密码。按回车后， `pg_dump` 会提示输入 `postgres` 用户密码。
- `-F` : 指定输出文件的格式，它可以是以下格式之一：
  - `c`: 自定义格式
  - `d`: 目录格式存档
  - `t`: tar 文件包
  - `p`: SQL 脚本文件
- `db_name` 是要备份的数据库的名字。
- `output.tar` 是输出文件的路径。

如果您在命令行或者终端工具中运行命令是提示找不到 `pg_dump` 工具，请先导航到 PostgreSQL bin 文件夹。例如：

```sql
C:\>cd C:\Program Files\PostgreSQL\14\bin
```

### 使用 `pg_dumpall` 备份所有数据库

除了 `pg_dump` 工具，PostgreSQL 还提供了可以一次备份所有数据库的 `pg_dumpall` 工具备份。 该 `pg_dumpall` 工具的用法如下：

```sql
pg_dumpall -U username > output.sql
```

### 使用 `pg_restore` 恢复数据库

PostgreSQL 提供了 `pg_restore` 工具用于恢复由 `pg_dump` 工具产生的 tar 文档和目录文档。

`pg_restore` 工具的用法如下：

```shell
pg_restore [option...] file_path
```

说明：

- `file_path` 是要恢复的文件或者目录的路径。

- ```
  option
  ```

  是一些恢复数据时用到的参数，比如，数据库，主机，端口 等。 您可以使用如下选项：

  | 参数                                                         | 说明                                                         |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | `-a` `--data-only`                                           | 只恢复数据，而不恢复表模式（数据定义）。                     |
  | `-c` `--clean`                                               | 创建数据库对象前先清理（删除）它们。                         |
  | `-C` `--create`                                              | 在恢复数据库之前先创建它。                                   |
  | `-d dbname` `--dbname=dbname`                                | 与数据库 dbname 联接并且直接恢复到该数据库中。               |
  | `-e` `--exit-on-error`                                       | 如果在向数据库发送 SQL 命令的时候碰到错误，则退出。缺省是继续执行并且在恢复 结束时显示一个错误计数。 |
  | `-f filename` `--file=filename`                              | 声明生成的脚本的输出文件，或者出现-l 选项时用于列表的文件，缺省是标准输出。 |
  | `-F format` `--format=format`                                | 声明备份文件的格式。                                         |
  | `-i` `--ignore-version`                                      | 忽略数据库版本检查。                                         |
  | `-I index` `--index=index`                                   | 只恢复命名的索引。                                           |
  | `-l` `--list`                                                | 列出备份的内容。这个操作的输出可以用 -L 选项限制和重排所恢复的项目。 |
  | `-L list-file` `--use-list=list-file`                        | 只恢复在 list-file 里面的元素，以它们在文件中出现的顺序。    |
  | `-n namespace` `--schema=schema`                             | 只恢复指定名字的模式里面的定义和/或数据。不要和 -s 选项混淆。这个选项可以和 -t 选项一起使用。 |
  | `-O` `--no-owner`                                            | 不要输出设置对象的权限，以便与最初的数据库匹配的命令。       |
  | `-s` `--schema-only`                                         | 只恢复表结构（数据定义）。不恢复数据，序列值将重置。         |
  | `-S username` `--superuser=username`                         | 设置关闭触发器时声明超级用户的用户名。只有在设置了 –disable-triggers 的时候 才有用。 |
  | `-t table` `--table=table`                                   | 只恢复表指定的表的定义和/或数据。                            |
  | `-T trigger` `--trigger=trigger`                             | 只恢复指定的触发器。                                         |
  | `-v` `--verbose`                                             | 声明冗余模式。                                               |
  | `-x` `--no-privileges` `--no-acl`                            | 避免 ACL 的恢复（grant/revoke 命令）                         |
  | `-X use-set-session-authorization` `--use-set-session-authorization` | 输出 SQL 标准的 SET SESSION AUTHORIZATION 命令，而不是 OWNER TO 命令。 |
  | `-X disable-triggers` `--disable-triggers`                   | 这个选项只有在执行仅恢复数据的时候才相关。                   |
  | `-h host` `--host=host`                                      | 声明服务器运行的机器的主机名。                               |
  | `-p port` `--port=port`                                      | 声明服务器侦听的 TCP 端口或者本地的 Unix 域套接字文件扩展。  |
  | `-U username`                                                | 以给出用户身分联接。                                         |
  | `-W`                                                         | 强制给出口令提示。如果服务器要求口令认证，那么这个应该自动发生。 |

最常用的 `pg_restore` 用法如下：

```shell
pg_restore -d db_name path_to_db_backup_file.tar
```

### 如何使用 psql 恢复数据库

您可以使用 psql 工具从一个 sql 文件中恢复数据。 以下是使用 psql 从 sql 文件恢复数据的基本用法：

```sql
psql -U username -f path_to_db_backup_file.sql
```

### 使用 `\i` 命令导入 sql 文件

您还可以 `\i` 命令导入 sql 文件。 以下演示了[导入 sakila 示例数据库](https://www.sjkjc.com/postgresql/sample-database/)的步骤：

1. 启动 psql 工具并连接 PostgreSQL 服务器：

   ```powershell
   .\psql.exe -U postgres
   ```

   根据提示输入 postgres 用户的密码，然后按下回车键。

2. 创建 sakila 数据库

   ```postgresql
   CREATE DATABASE sakila;
   ```

3. 连接 sakila 数据库

   ```postgresql
   \c sakila;
   ```

4. 分别使用以下两个语句以导入刚刚下载的两个文件 `postgres-sakila-schema.sql` 和 `postgres-sakila-insert-data.sql` ：

   ```postgresql
   \i C:/Users/Adam/Downloads/postgres-sakila-schema.sql
   \i C:/Users/Adam/Downloads/postgres-sakila-insert-data.sql
   ```

   请注意，请使用 `/` 替换文件路径中的 `\` 。

### 结论

本文讨论了备份和恢复 PostgreSQL 数据库的几种方法。