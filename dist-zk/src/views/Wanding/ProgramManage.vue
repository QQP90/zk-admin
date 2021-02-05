<template>
  <div class="container custom-page-view" ref="view">
    <div class="custom-page-view-search" ref="search">
      <a-breadcrumb separator="/">
        <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="{ path: item.path }">{{
          item.meta.title
        }}</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="current_location">
        <a-button type="primary" @click="EditInfo(-1)" class="bbar-a">新增</a-button>
      </div>
      <a-form layout="inline" style="display:flex;flex-wrap:wrap;padding-left:15px" :form="form">
        <a-form-item label="栏目id">
          <a-input v-model="queryParams.id" placeholder="请输入" style="width:100px" />
        </a-form-item>

        <a-form-item label="栏目名称">
          <a-input v-model="queryParams.name" placeholder="请输入" style="width:280px" />
        </a-form-item>

        <a-form-item label="是否前端显示">
          <a-select style="width:100px;" v-model="queryParams.isShow">
            <a-select-option :value="0">全部</a-select-option>
            <a-select-option :value="1">是</a-select-option>
            <a-select-option :value="2">否</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <div>
            <a-button type="primary" icon="search" @click="loadData(1)">查询</a-button>
            <a-button :size="formItemSize" icon="redo" style="margin-left: 8px" @click="handleResect">重置</a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <div class="custom-page-view-table">
      <a-table
        :scroll="{ y: tableHeight }"
        size="middle"
        :columns="columns"
        :dataSource="dataList"
        :pagination="false"
        rowKey="id"
        slot="expandedRowRender"
      >
        
      <!-- :loading="dataLoading" -->
        <span slot="createUser" slot-scope="text, record">
          <div v-if="text" class="auditRemark">
            <div>{{ record.createUser }}--{{ record.createTime }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <span slot="fontShow" slot-scope="text, record">
          <div v-if="record.isShow == 1" class="auditRemark">
            <div>是</div>
          </div>
          <div v-if="record.isShow == 2">否</div>
        </span>

        <!-- 最近审核人 -->
        <span slot="modifyUser" slot-scope="text, record">
          <div v-if="text" class="offlineRemark">
            <div>{{ record.modifyUser }}--{{ record.modifyTime }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a-tooltip title="编辑">
              <a-button shape="circle" icon="form" @click="EditInfo(record)"></a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button shape="circle" icon="delete" @click="OnDelete(record)"></a-button>
            </a-tooltip>
            <a-tooltip title="栏目词条">
              <a-button @click="GotoPMInfo(record)" shape="circle" icon="project"></a-button>
            </a-tooltip>
          </template>
        </span>
      </a-table>
    </div>

    <div class="custom-page-view-footer" ref="footer">
      <div class="custom-page-view-pager">
        <a-pagination
          showSizeChanger
          :pageSize.sync="pageSize"
          @showSizeChange="onPageSizeChange"
          @change="onPageIndexChange"
          :total.sync="dataCount"
          :showTotal="(total, range) => `共${total}条，当前第${range[0]}-${range[1]}条`"
          v-model="pageIndex"
        />
      </div>
    </div>
    <!--  -->
    <a-drawer
      width="80%"
      placement="right"
      :closable="false"
      :title="formTitle"
      :visible="wandingvisibleForm"
      @close="handleCloseForm"
    >
      <PMInfo :id="currentId" ref="PMInfo"></PMInfo>
    </a-drawer>
    <!-- 添加，编辑信息 -->
    <a-modal
      :title="formTitle"
      :visible="infovisibleForm"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
    >
      <a-form :form="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
        <!-- <div class="disease-box">
       <div v-for="d in artWords" :key="d.id">
            {{ d.hospitalName }}-{{ d.labName }}
            <a-icon type="close" class="iconx" @click="hangeleDelete1(d)" />
          </div>
          <a-tag
            @click="handleOpenSelectLabModal('art')"
            style="background: #fff; borderStyle: dashed; margin-left:20px; "
          >
            <a-icon type="plus" />关联文章
          </a-tag> 
        </div> -->
        <a-form-item label="栏目名称">
          <a-input
            placeholder="请输入部位名称"
            v-decorator="[
              'name',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入部位名称'
                  }
                ]
              }
            ]"
          />
        </a-form-item>
        <a-form-item label="是否前端显示">
          <a-radio-group
            v-decorator="['isShow', { initialValue: 1 }, { rules: [{ required: true, message: '请选择' }] }]"
            name="radioGroup"
          >
            <a-radio :value="1">
              是
            </a-radio>
            <a-radio :value="2">
              否
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea placeholder="请输入" v-decorator="['description']" />
        </a-form-item>
        <div style="display:flex;justify-content: space-between;">
          <a-button type="primary" @click="handleCloseForm">取消</a-button>
          <a-button type="primary" @click="clickSubmit">提交</a-button>
        </div>
      </a-form>
    </a-modal>
    <a-modal title="选中栏目标签" width="80%" v-model="WordsisShow" @cancel="handleCloseForm" :footer="null" centered>
      <DoctorViewPoint ref="labList" :current_url="current_url"></DoctorViewPoint>
    </a-modal>
  </div>
</template>

<script>
import apiProgram from '@/api/apiProgram'
import moment from 'moment'
import qs from 'qs'
import { Button } from 'ant-design-vue'
import PMInfo from './ProgramManageInfo'
import DoctorViewPoint from '../Lab/DoctorViewPoint'
import commonListView from '@/mixins/commonListView'

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: '80px'
  },
  {
    title: '栏目名称',
    dataIndex: 'name',
    key: 'name',
    width: '150px'
  },
  {
    title: '备注',
    dataIndex: 'description',
    key: 'description',
    width: '150px'
  },
  {
    title: '是否前端显示',
    dataIndex: 'fontShow',
    key: 'fontShow',
    scopedSlots: { customRender: 'fontShow' },
    width: '150px'
  },
  {
    title: '创建人及时间',
    width: '200px',
    dataIndex: 'createUser',
    key: 'createUser',
    scopedSlots: { customRender: 'createUser' }
  },
  {
    title: '最后编辑人及时间',
    width: '200px',
    dataIndex: 'modifyUser',
    key: 'modifyUser',
    scopedSlots: { customRender: 'modifyUser' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    width: '320px'
  }
]

export default {
  mixins: [commonListView],
  name: 'ProgramManage',
  components: {
    DoctorViewPoint,
    PMInfo
  },
  data() {
    return {
      form: this.$form.createForm(this, { name: 'coordinated' }),
      current: [''],
      formItemSize: 'default',
      linkWords: [], //关联词条
      artWords: [], //文章
      WordsisShow: false,
      current_url: '',
      dataList: [],
      // 主数据是否加载中
      dataLoading: false,
      isShowLabModal: false,
      // 查询条件
      queryParams: {
        name: '',
        id: null,
        isShow: 0
      },
      // 表格
      columns,
      pageSize: 10,
      pageIndex: 1,
      dataCount: 0,
      // 上下线ids
      ids: [],
      // 表单title
      formTitle: '',
      //基本信息
      infovisibleForm: false,
      wandingvisibleForm: false,
      reason: '',
      disable: false, //用户当前ID
      breadcrumbList: [],
      currentId: null,
      currentItem: {}
    }
  },

  created() {
    this.breadcrumbList = this.$route.matched
    this.loadData()
  },
  watch: {
    $route(to, from) {
      this.breadcrumbList = to.matched
    }
  },

  methods: {
    moment,
    loadData() {
      let ps = Object.assign(
        {
          pageSize: this.pageSize,
          pageIndex: this.pageIndex
        },
        this.queryParams
      )
      this.dataLoading = true

      apiProgram
        .getdata(ps)
        .then(res => {
          this.dataLoading = false
          if (res.code === 200) {
            this.dataList = res.data.items
            for(var i=0;i< this.dataList.length;i++){
             delete this.dataList[i]['children']
            }
            this.dataCount = res.data.itemCount
            this.changePage = false
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
    },
    handleResect() {
      this.queryParams = {}
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

    GotoPMInfo(item) {
      this.currentId = item.id
      this.wandingvisibleForm = true
      this.formTitle = '当前栏目:' + item.name
      var _that = this
      setTimeout(() => {
        _that.$refs.PMInfo.loadData()
      }, 500)
    },

    //删除
    OnDelete(item) {
      apiProgram
        .delData(item)
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

    handleCloseForm() {
      this.infovisibleForm = false
      this.wandingvisibleForm = false
      this.WordsisShow = false
    },
    //基本信息
    EditInfo(record) {
      if (record == -1) {
        this.infovisibleForm = true
        this.currentId = null
        this.formTitle = '新增部位'
        this.$nextTick(() => {
          this.form.setFieldsValue({
            name: null,
            isShow: 1,
            description: null
          })
        })
        return
      } else {
        this.currentId = record.id
        this.formTitle = record.name + '-基本信息'
        this.infovisibleForm = true
        this.$nextTick(() => {
          this.form.setFieldsValue({
            name: record.name,
            isShow: record.isShow,
            description: record.description
          })
        })
      }
    },

    clickSubmit() {
      this.dataLoading = true
      const {
        form: { validateFields }
      } = this
      validateFields((errors, values) => {
        this.currentItem = { ...values }
        if (this.currentId) {
          this.currentItem.id = this.currentId
        }
        console.log(this.currentItem, this.currentId, 87)

        apiProgram
          .sendData(this.currentItem)
          .then(res => {
            if (res.code == 200) {
              this.dataLoading = false
              this.$message.success('添加成功')
              this.loadData()
              this.infovisibleForm = false
            }
          })
          .catch(err => {
            this.$message.warning(err.message)
          })
      })
    },
    handleSelectLab() {},
    // handleOpenSelectLabModal(str) {
    //   switch (str) {
    //     case 'link':
    //       this.WordsisShow = true
    //       this.current_url = 'link'
    //       break
    //     case 'art':
    //       this.WordsisShow = true
    //       this.current_url = 'art'
    //       setTimeout(() => {
    //         this.$refs.labList.loadData()
    //       }, 500);
    //       break

    //     default:
    //       break
    //   }
    // }
  }
}
</script>
<style scoped lang="less">
@import '../../layouts/CustomListViewStyle.less';
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
</style>
