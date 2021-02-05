<template>
  <div>
    <a-row>
      <a-col :span="15">
        <div class="search-wrap">
          <a-input-search
            v-model="keyword"
            placeholder="输入名称、别名、拼音以搜索疾病"
            @search="loadData(1)"
            enterButton
          />
        </div>
        <div class="list-wrap">
          <a-list itemLayout="vertical" size="small" :dataSource="dataList">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <a-list-item-meta :description="item.alias">
                <span slot="title" v-html="formatDiseaseName(item.name)"></span>
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
      <a-col :span="9" style="padding-left:10px;">
        <div class="selected-box">
          <div class="selected-title">已添加</div>
          <div class="selected-list">
            <div class="selected-item list-title" style="font-weight:bold;">
              <div class="info">词条</div>
              <div class="info">是否为子级</div>
              <div class="order">权重值</div>
            </div>
            <div class="selected-item" v-for="(d,index) in selectedDiseases" :key="index" :title="d.name">
              <div class="info">{{d.name}}</div>
              <a-select v-model="d.type">
                <a-select-option :value=1>是</a-select-option>
                <a-select-option :value=0>否</a-select-option>
              </a-select>
              <div class="order">
                <a-input-number
                  size="small"
                  :min="0"
                  :max="999"
                  style="width:50px;"
                  v-model="d.order"
                  @change="(val) => handleScoreChange(d, val)"
                ></a-input-number>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-button type="primary" @click="save">确定</a-button>
  </div>
</template>
<script>
import apiProgram from '@/api/apiProgram'

export default {
  props: {
    selectedDiseases: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      dataList: [],
      dataCount: [], // 数据总数
      pageSize: 10,
      pageIndex: 1,
      keyword: '', // 疾病查询关键字
      // 主数据是否加载中
      dataLoading: false,
      selectedRowKeys: [], // 选中的数据index
      selectedRows: [], // 选中的数据
    
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData(pageIndex) {
      if (pageIndex) {
        this.pageIndex = pageIndex
      }
      let ps = {
        name: this.keyword,
        pageSize: this.pageSize,
        pageIndex: this.pageIndex
      }
      this.dataLoading = true
      apiProgram
        .getDiseaseword(ps)
        .then(res => {
          console.log(res)
          this.dataLoading = false
          if (res.code === 200) {
            this.dataList = res.data.items
            this.dataCount = res.data.itemCount
          }
        })
        .catch(err => {})
    },
    save(){
      this.$emit('save',this.selectedDiseases)
      
    },
    formatDiseaseName(name) {
      if (name.indexOf(this.keyword) != -1) {
        return name.replace(this.keyword, `<strong style="color:red;">${this.keyword}</strong>`)
      } else {
        return name
      }
    },
    handleSelect(item) {
      // set方法设置推荐分的值，直接.score设置无法双向绑定
      // this.$set(ittem, 'score', 0);
      let ids = this.selectedDiseases.map(v => {
        return v.id
      })
      if (ids.indexOf(item.id) > -1) {
        this.$message.warning('您选择的已存在，请勿重复添加！')
        return
      }
      this.selectedDiseases.push({
        id: item.id,
        order: 0,
        status: item.status,
        name: item.name
      })
      console.log('selectedDisease', this.selectedDiseases)
    },
    onPageIndexChange(page, pageSize) {
      this.pageIndex = page
      this.loadData()
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      console.log('selectedRowKeys changed: ', selectedRows)
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    getSelection() {
      return this.selectedRows
    },
    handleScoreChange(item, val) {
      item.order = Math.round(item.order)
      console.log('handleScoreChange', item, val)
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
        width: 50px;
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
</style>