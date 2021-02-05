### 列表页布局模板

#### 目的及思路
为最大化主数据区域，以让单屏内显示尽可能多的数据；同时统一项目UI风格。
按用户操作习惯及页面展示惯例，页面从上至下分为3个模块：
- 搜索区域（查询条件等）
- 主体数据区域   
> 数据表格内，为尽可能方便用户浏览数据，   
设计为：当数据条数超出以致页面需要下拉时，仅内容区域出现滚动条，即页面无需滚动，仅内容区域滚动。
- 底部工具区域（操作按钮、分页条）

#### 实现方式
目前采用统一列表页页面结构及引入`mixin`实现。   
实现方式为在页面加载时动态计算页面高度，并将结果设置到table控件上以实现仅内容区域滚动。   
`mixin`文件地址：`@/mixins/commonListView`

页面Demo：
```html
<template>
    <!-- ref属性须按以下demo设定，因为动态计算高度需要使用到 -->
    <div class="container custom-page-view" ref="view">
        <!-- 搜索区域 -->
        <div class="custom-page-view-search" ref="search">
        </div>
        <!-- 内容区域 -->
        <div class="custom-page-view-table">
            <a-table size="small" 
                :scroll="{ y: tableHeight }">
            </a-table>
        </div>
        <!-- 底部操作区域 -->
        <div class="custom-page-view-footer" ref="footer">
        </div>
    </div>
</template>
<script>
// 导入mixins
import commonListView from '@/mixins/commonListView';
export default {
    data() {
        return {}
    },
    // 使用mixin
    mixins: [commonListView]
}
</script>
<style lang="less" scoped>
// 导入样式
@import '../../layouts/CustomListViewStyle.less';
</style>
```