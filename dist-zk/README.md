## 新版YYK管理后台UI项目

### 项目简介
项目为新版YYK管理后台，主要提供医院科室医生相关基础数据及营销数据的维护管理功能。



### 技术栈
`Vue`、`Vue-Cli3`、`Yarn`、`Ant-Design-Vue`
> 包管理器为`Yarn`

基于Ant-Design-Vue-Pro脚手架开发

- Preview: https://preview.pro.loacg.com
- Home Page: https://pro.loacg.com
- Documentation: https://pro.loacg.com/docs/getting-started
### 新增组件
- distpicker-简单易用的地区选择器
```
yarn add v-distpicker --save
```
### 项目安装及运行

- Install dependencies
```
yarn install
```

- Compiles and hot-reloads for development
```
yarn run serve
```

- Compiles and minifies for production
```
yarn build
```

- Lints and fixes files
```
yarn run lint
```

### 项目相关约定
- 列表页布局请参考[列表页布局](ListPageLayout.md)
- 小型表单可采用弹窗`a-modal`实现，复杂或较大表单，采用抽屉`a-drawer`实现。
- 部分按钮Icon
> 删除：delete   
编辑：form   
查看：eye   
查询：search  
重置：redo   
新增：plus   
保存：check   
取消：rollback   
上传：upload      
下载：download      
上线：arrow-up      
下线：arrow-down   

