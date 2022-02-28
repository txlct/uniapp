# lctfe-client-uniapp

Fork from [uni-app](https://github.com/dcloudio/uni-app), and with custom codebase support.


## 定制化功能

- 支持MPA(多页面应用)模式
- 移除无用的多语言包`@dcloudio/uni-cli-i18n`，精简包大小


## 快速开始

### PreRequirements

仓库使用 `yarn` 作为package管理工具

```bash
# 如果还没有安装，则需要安装yarn
npm i yarn -g
```

### 依赖安装

使用 yarn 作为依赖安装工具

```bash
# using yarn as package dependencies manager
yarn
```

### 生产&alpha版本打包

- prod 生产打包

构建打包使用 [`lerna`](https://github.com/lerna/lerna) 作为monorepo 管理工具，采用如下脚本进行打包


```bash
yarn release
```

- alpha 打包

使用如下脚本进行alpha 版本的打包

```bash
yarn release:alpha
```

## 代码提交规范

代码开发规范以及指引，请参考[开发规范与说明](./CONTRIBUTING.md)

## 分支管理

- master 分支作为默认分支，并设置为受保护分支。
- 修改的特性分支从 master 进行检出，测试验证无误后，提交MR到master，由仓库master进行代码CR。
- CR通过后自动合并到master。

## CI 自动化

- 引入了Orange-CI 作为CI自动化工具，代码提交或者合并到master，即可触发CI 自动执行，自动打tag 以及生成CHANGELOG.md。
- 支持CR通过后自动合并，打tag和生成CHANGELOG.md

## 更新日志

本仓库更新日志，详见[版本迭代历史](./CHANGELOG.md)

## 代码从uni-app源仓库进行更新

如下步骤仅 uni-app 仓库底层维护人员查阅，业务人员可直接忽略。


```bash
# 这一步已经初始化执行过，业务可忽略并且跳过！！ 设置git remote upstream
git remote add upstream https://github.com/dcloudio/uni-app.git

# 查看git remote明细，业务可跳过
git remote -v

# 从upstream 获取master代码更新，仅当需要从uni-app 获取更新的时候进行，建议谨慎并且在非master分支执行！！
git pull upstream master
```

## 更多资料

- 评测：[跨端开发框架深度横评之2020版](https://juejin.im/post/5e8e8d5a6fb9a03c6d3d9f42)
- 评测：[深入测试一周，主流多端框架大比武](https://mp.weixin.qq.com/s/jIDEHfuMnED6HTfNgjsW4w)
- [uni-app在App端和flutter、react native的比较](https://ask.dcloud.net.cn/article/36083)