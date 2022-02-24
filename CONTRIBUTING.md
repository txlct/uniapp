# Contributing

## 记录在uni-app 仓库底层源码实现的一些代码改动及功能调整

- 去除 `@dcloudio/uni-cli-i18n` 多语言包，方便业务能平滑升级uni-app master 最新代码。
- 支持MPA(多页应用)模式

## Merge Requests

通过MR（Merge Requests）将已经通过测试的代码合并到master。

### 分支管理

主仓库的 master 分支，其将作为稳定的已经通过测试的分支代码。


```
MR devops CI
 ↑ 合并主干的MR触发蓝盾自动化CI，校验ESLint 等是否通过公司规范，并且Reviewer 进行Code Review，两者均通过后合并到master
master
 ↑ 开发者提出MR，将feature分支提交MR到master分支
your_feature base on master
```

### Commit Message

我们希望您能遵守 [约定式提交（Conventional Commits）](https://www.conventionalcommits.org/zh-hans/)，保持项目的一致性，也可以方便生成每个版本的 Changelog，很容易地被追溯。

- feat：新功能（feature）
- fix：修补bug
- docs：文档（documentation）
- style：格式（不影响代码运行的变动）
- refactor：重构（即不是新增功能，也不是修改bug的代码变动）
- test：增加测试
- chore：构建过程或辅助工具的变动

## MR流程

团队负责的Reviewer会查看所有的 MR，包括在合并之前的自动运行的代码检查和测试，一经代码检查及Review通过，我们会接受这次 MR 并且合并到master。

当开发者准备 MR 时，请确保已经完成以下几个步骤:

1. 基于 `master` 分支创建您的开发分支。
2. 如果更改了 API(s) 请更新代码及文档。
3. 检查您的分支的代码语法及格式。
4. 提一个 MR 到主仓库的 `master` 分支上。