<template>
  <div class="container custom-page-view" ref="view">
    <!-- <a-form layout="inline" style="display:flex;flex-wrap:wrap;padding-left:15px" :form="form">
      <a-form-item label="词条id">
        <a-input v-model="queryParams.id" placeholder="请输入" style="width:100px" />
      </a-form-item>

      <a-form-item label="词条名称">
        <a-input v-model="queryParams.name" placeholder="请输入" style="width:280px" />
      </a-form-item>

      <a-form-item>
        <div>
          <a-button type="primary" icon="search" @click="loadData(1)">查询</a-button>
          <a-button :size="formItemSize" icon="redo" style="margin-left: 8px" @click="handleResect">重置</a-button>
        </div>
      </a-form-item>
    </a-form> -->

    <div class="custom-page-view-table">
      <a-button @click="addWording" type="primary">添加词条</a-button
      ><a-button @click="someDelete(-1)" :disabled="!hadSelected" style="margin-left:20px">批量删除</a-button>
      <a-table
        :columns="columns"
        :dataSource="dataList"
        :loading="dataLoading"
        :pagination="false"
        rowKey="id"
        :rowSelection="{ onChange: onSelectChange }"
      >

        <span slot="auditRemark" slot-scope="text, record">
          <div v-if="text" class="auditRemark" :title="text">
            <div>{{ text }}--{{ record.createTime }}</div>
          </div>
          <div v-else>-</div>
        </span>

        <span slot="modifyUser" slot-scope="text, record">
          <div v-if="text" class="offlineRemark" :title="text">
            <div>{{ text }}</div>
            <div>{{ record.modifyTime }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <span slot="action" slot-scope="text, record, index">
          <template>
            <!-- <a-tooltip title="查看">
              <a-button shape="circle" icon="eye" @click="EditInfo(record)"></a-button>
            </a-tooltip> -->
            <a-tooltip title="删除">
              <a-button shape="circle" icon="delete" @click="someDelete(record.id)"></a-button>
            </a-tooltip>
          </template>
        </span>
      </a-table>
    </div>

    <!-- 添加，编辑信息 -->
    <a-modal
      :title="formTitle"
      :visible="infovisibleForm"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
      width="60%"
    >
      <addWordingForm :obj="obj" ref="addWording" @close="handleCloseForm"></addWordingForm>
     
    </a-modal>
  </div>
</template>

<script>
import apiProgram from '@/api/apiProgram'
import moment from 'moment'
import qs from 'qs'
import addWordingForm from './addWording'
import commonListView from '@/mixins/commonListView'
import bus from '@/utils/bus'

const columns = [
  {
    title: '词条id',
    dataIndex: 'id',
    key: 'id',
    width: '80px'
  },
  {
    title: '词条名称',
    dataIndex: 'name',
    key: 'name',
    width: '150px'
  },

  {
    title: '创建人及时间',
    dataIndex: 'auditRemark',
    width: '200px',
    scopedSlots: { customRender: 'auditRemark' }
  },
  {
    title: '最后编辑人及时间',
    dataIndex: 'modifyUser',
    width: '200px',
    scopedSlots: { customRender: 'modifyUser' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: '320px'
  }
]

export default {
  // mixins: [commonListView],

  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  components: {
    addWordingForm
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: 'coordinated' }),
      current: [''],
      formItemSize: 'default',
      //数据列表
      dataList: [],
      // 主数据是否加载中
      dataLoading: false,
      // 表格
      columns,
      obj: {}, //字条id
      // children的ids
      ids: [],
      // 表单title
      formTitle: '',
      //基本信息
      infovisibleForm: false,
      wandingvisibleForm: false,
      reason: '',
      selectedRowKeys: [],
      breadcrumbList: [],
      currentId: null,
      addWordingshow: false, //添加词条弹窗
  
    }
  },
  // created(){
  //     bus.$on('getTarget', target => {
  //           console.log(target,1258);
  //       });
  // },
  computed: {
    hadSelected() {
      return this.selectedRowKeys.length > 0
    }
  },

  methods: {
    moment,
    loadData() {
      this.dataLoading = true
      apiProgram
        .getdatadetail(this.id)
        .then(res => {
          if (res.code == 200) {
            this.dataLoading = false
            this.dataList = res.data.children
            this.obj = res.data
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
    },
    handleResect() {
      this.queryParams = { labId: 0, status: '', modifyUser: '' }
      this.pageIndex = 1
      this.loadData()
    },
    //设置时间
    SetTime(value) {
      let d = new Date(value)
      let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
      let min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
      let sec = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
      let times = d.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec
      return times
    },
    onPageSizeChange(current, size) {
      this.pageSize = size
      // 从第一页重新加载
      this.loadData(1)
    },
    onPageIndexChange(page, pageSize) {
      this.pageIndex = page
      this.changePage = true
      this.loadData()
    },
    // 修改，第二个参数是选中的数据，同时选中会无法勾选
    onSelectChange(select, selectedRowKeys) {
      this.selectedRowKeys = select
      this.ids = selectedRowKeys.map(v => {
        return v.id
      })
    },

    addWording() {
      this.infovisibleForm = true
      this.formTitle = '添加词条'
      setTimeout(() => {
        this.$refs.addWording.selectedDiseases = [...this.obj.children]
        this.$refs.addWording.loadData()
      }, 500)
    },
    someDelete(i) {
      this.dataLoading = true
      if (i == -1) {
        let ids = this.obj.children.map(v => {
          return v.id
        })
        let list = ids.filter(items => {
          if (!this.ids.includes(items)) return items
        })
        this.obj.childIds = list
      } else {
        let ids = this.obj.children.map(v => {
          return v.id
        })
        let list = ids.filter(items => {
          if (i != items) return items
        })
        this.obj.childIds = list
      }
      delete this.obj.children
      apiProgram.sendData(this.obj).then(res => {
        if (res.code == 200) {
          this.dataLoading = false
          this.$message.success('操作成功')
          this.loadData()
        }
      })
    },
    //删除
    OnDelete() {
      let ps = {
        ids: this.ids
      }
      GetDelete(qs.stringify(ps))
        .then(res => {
          if (res.code === 200) {
            this.$message.success(`删除成功`)
            this.loadData()
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
          this.loadData()
        })
    },

    //审核通过
    examine() {
      this.dataLoading = true
      let ps = {
        ids: this.ids
      }
      PutExamine(ps)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(`审核通过`)
            this.loadData()
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
      this.dataLoading = false
    },

    handleCloseForm() {
      this.infovisibleForm = false
      this.addWordingshow = false
      this.loadData()
    },

    clickSubmit() {}
  }
}
</script>
<style scoped lang="less">
// @import '../../layouts/CustomListViewStyle.less';
.current_location {
  margin: 25px 0;
  span {
    font-size: 18px;
    margin-left: 16px;
    margin-right: 16px;
  }
}
.search-wrap {
  margin-bottom: 20px;
}
.offlineRemark,
.auditRemark {
  width: 150px;
  letter-spacing: 0;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2; /*要显示的行数*/
  -webkit-box-orient: vertical;
  font-size: 12px;
  cursor: pointer;
}
.hospital {
  width: 100px;
  word-break: break-word;
  text-align: center;
}
.bbar-wrap {
  margin-top: 20px;
}
.bbar-a {
  margin-right: 15px;
  margin-left: 0px;
}

.avatar {
  width: 80px;
  float: left;
  border-radius: 5px;
}
.hospitalName {
  width: 100px;
}
.labname {
  width: 100px;
  word-break: break-word;
}
.custom-page-view-table {
  height: 600px !important;
}
</style>
