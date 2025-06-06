# nftables

> nftables 和 iptables 很相似,但是比 iptables 更强大

## 查看规则列表
```bash
# 查看所有规则
nft list ruleset

# 查看所有规则,并附带 handle (句柄号)
nft --handle list ruleset
```

## 新增操作
```bash
# 新增表
nft add table <ip|ip6|inet> <表名>

# 新增规则链
nft add chain <ip|ip6|inet> <表名> <规则链名> {"这里可以指定链的hook事件触发,也可以不写,通过别的链 jump 跳转到该链"}

# 新增规则
nft add rule <ip|ip6|inet> <表名> <规则链名> "规则内容"
```
## 删除操作
```bash
# 删除表
nft delete table <表名>

# 删除规则链
nft delete chain <表名> <规则链名>

# 删除规则需要结合上面查询到的句柄号进行删除
nft delete <table|chain|rule> <ip|ip6|inet> <表名> <规则链名> handle <句柄号>
```
