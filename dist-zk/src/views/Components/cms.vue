<template>
  <div>
    <a-row>
      <a-col :span="15">
        <div class="cms-top">
          <div>id: <a-input style="width:120px" v-model="getCmsParams.articleId" placeholder="输入文章id" /></div>
          <div>关键字: <a-input style="width:180px" v-model="getCmsParams.words" placeholder="输入文章关键字" /></div>
          <div><a-button type="primary" @click="loadData(1)">查询</a-button></div>
        </div>
        <div class="list-wrap">
          <a-list itemLayout="vertical" size="small" :dataSource="dataList">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-list-item-meta :description="item.alias">
                <span slot="title" v-html="formatDiseaseName(item.title)"></span>
              </a-list-item-meta>
              <span slot="extra" style="padding-right: 10px;">
                <a-icon type="plus" @click="handleSelect(item)"></a-icon>
              </span>
            </a-list-item>
          </a-list>
        </div>
        <div class="toolbar-wrap">
          <a-pagination
            size="small"
            v-if="dataCount > 0"
            :pageSize.sync="pageSize"
            @change="onPageIndexChange"
            :total.sync="dataCount"
            showQuickJumper
            :showTotal="(total, range) => `共${total}条，当前第${range[0]}-${range[1]}条`"
            v-model="pageIndex"
          />
        </div>
      </a-col>

      <!--  -->

      <a-col :span="9" style="padding-left:10px;">
        <div class="selected-box">
          <div class="selected-title">已添加</div>
          <div class="selected-list">
            <div class="selected-item list-title" style="font-weight:bold;">
              <div class="info">文章</div>
            </div>
            <div class="selected-item" v-for="(d, index) in selectedDiseases" :key="d.articleId" :title="d.title">
              <div class="info">{{ d.title }}</div>
            
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-button @click="doClick">确定</a-button>
  </div>
</template>
<script>
import apiProgram from '@/api/apiProgram'
// import bus from '@/utils/bus'

export default {
  data() {
    return {
      dataList: [],
      dataCount: [], // 数据总数
      pageSize: 10,
      pageIndex: 1,

      // 主数据是否加载中
      dataLoading: false,
      selectedRowKeys: [], // 选中的数据index
      selectedRows: [], // 选中的数据
     
      getCmsParams: { articleId: null, words: '' } //获取cms参数
    }
  },
props:{
 selectedDiseases: [], //右侧数组
},
  methods: {
    loadData(pageIndex) {
      if (pageIndex) {
        this.pageIndex = pageIndex
      }

      let ps = {
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        ...this.getCmsParams
      }
      this.dataLoading = true
      apiProgram
        .getDoctorsViewCms(ps)
        .then(res => {
          this.dataLoading = false
          if (res.code === 200) {
            this.dataList = res.data.items
            this.dataCount = res.data.itemCount
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },

    formatDiseaseName(title) {
      if (title.indexOf(this.keyword) != -1) {
        return title.replace(this.keyword, `<strong style="color:red;">${this.keyword}</strong>`)
      } else {
        return title
      }
    },
    handleSelect(item) {
      // set方法设置推荐分的值，直接.score设置无法双向绑定
      // this.$set(ittem, 'score', 0);

      let ids = this.selectedDiseases.map(v => {
        return v.articleId
      })
      if (ids.indexOf(item.articleId) > -1) {
        this.$message.warning('您选择的已存在，请勿重复添加！')
        return
      }
      this.selectedDiseases.push({
        articleId: item.articleId,
        articleUrl:item.articleUrl,
        doctorHospitalName:item.doctorHospitalName,
        doctorImg:item.doctorImg,
        doctorLabName:item.doctorLabName,
        doctorName:item.doctorName,
        doctorPost:item.doctorPost,
        summarize:item.summarize,
        title: item.title
      })
      console.log(item, this.selectedDiseases)
    },
    // 点击完成
    doClick() {
      this.$emit('save',this.selectedDiseases)

    },
    onPageIndexChange(page, pageSize) {
      this.pageIndex = page
      this.loadData()
    },

    getSelection() {
      return this.selectedRows
    },
    handleScoreChange(item, val) {
      item.order = Math.round(item.order)
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-input-search-enter-button .ant-input-group-addon .ant-input-search-button {
  width: 100%;
  margin: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.list-wrap {
  margin: 5px 0;
  height: 400px;
  overflow: auto;
  border-bottom: 1px solid #eee;
}
.toolbar-wrap {
  margin-top: 10px;
}
.ant-list-sm .ant-list-item {
  padding: 5px 0;

  .ant-list-item-meta {
    margin-bottom: 5px;

    .ant-list-item-meta-title {
      margin-bottom: 5px;
      font-size: 13px;
      line-height: 20px;
    }
    .ant-list-item-meta-description {
      font-size: 12px;
      line-height: 16px;
    }
  }
  .ant-list-item-extra {
    font-size: 13px;
    padding-right: 5px;
  }
}
.selected-box {
  height: 100%;
  border: 1px solid #efefef;
  border-radius: 5px;

  .selected-title {
    padding: 5px;
    font-weight: 500;
    border-bottom: 1px solid #efefef;
  }
  .selected-list {
    height: 450px;
    overflow: auto;
    padding: 0 10px;
    .list-title {
      padding: 10px;
    }
    .selected-item {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      .order {
        display: flex;
        width: 80px;
        text-align: right;
      }
    }
    .selected-item:hover {
      background: #efefef;
    }
  }
}
/deep/ .ant-btn {
  margin-left: 20px;
}
/deep/ .ant-col-6 {
  display: flex;
}
.cms-top {
  display: flex;
}
</style>
