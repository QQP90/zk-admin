<template>
  <div class="container custom-page-view" ref="view">
    <div class="custom-page-view-search" ref="search">
      <a-breadcrumb separator="/">
        <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="{ path: item.path }">{{
          item.meta.title
        }}</a-breadcrumb-item>
      </a-breadcrumb>
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :span="5">
            <a-form-item label="词条id">
              <a-input :size="formItemSize" v-model="queryParams.id" style="width:100px" placeholder="词条名称" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="词条名称">
              <a-input v-model="queryParams.name" style="width:280px" placeholder="词条名称" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="上线状态">
              <a-select style="width:100px;" v-model="queryParams.isOffline">
                <a-select-option :value="null">全部</a-select-option>
                <a-select-option :value="false">上线</a-select-option>
                <a-select-option :value="true">下线</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="最后编辑人">
              <a-input
                :size="formItemSize"
                v-model="queryParams.modifyUser"
                placeholder="最后编辑人"
                style="width:150px"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="14">
            <a-form-item label="最后修改时间">
              <a-range-picker @change="onChange" />
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item>
              <div>
                <a-button type="primary" icon="search" @click="loadData">查询</a-button>
                <a-button :size="formItemSize" icon="redo" style="margin-left: 8px" @click="handleResect"
                  >重置</a-button
                >
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-menu v-model="current" mode="horizontal" @select="handleTurnStatus">
        <a-menu-item key="0" class="bbar-a">
          待审核
          <a-badge :count="count_unverify"></a-badge>
        </a-menu-item>
        <a-menu-item key="3" class="bbar-a">
          审核不通过
          <a-badge :count="count_verifyfailed"></a-badge>
        </a-menu-item>
        <a-menu-item key="on" class="bbar-a">已上线</a-menu-item>
        <a-menu-item key="off" class="bbar-a">已下线</a-menu-item>
        <a-menu-item key class="bbar-a">全部</a-menu-item>
      </a-menu>
    </div>
    <div class="custom-page-view-table">
      <a-table
        :scroll="{ y: tableHeight }"
        size="middle"
        :columns="columns"
        :dataSource="dataList"
      
        :pagination="false"
        rowKey="id"
        :rowSelection="{ onChange: onSelectChange }"
      >
      <!--   :loading="dataLoading" -->
        <span slot="name" slot-scope="text">
          <div class="labname">{{ text }}</div>
        </span>
        <span slot="hospitalName" slot-scope="text, record">
          <div class="hospitalName">{{ text }}({{ record.hospitalId }})</div>
        </span>

        <span slot="isOffline" slot-scope="val">
          <a-badge v-if="val == null" status="default" text="未上线" />
          <a-badge v-else-if="val == true" status="default" text="已下线" />
          <a-badge v-else status="success" text="已上线" />
        </span>
        <!-- 审核不通过原因 -->
        <span slot="auditRemark" slot-scope="text, record">
          <div v-if="text" class="auditRemark" :title="text">
            <div>{{ text }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <!-- 创建人 -->
        <span slot="createUser" slot-scope="text, record">
          <div v-if="text" class="offlineRemark" :title="text">
            <div>{{ text }}</div>
            <div>{{ record.createTime }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <!-- 最近编辑 -->
        <span slot="modifyUser" slot-scope="text, record">
          <div v-if="text" class="offlineRemark" :title="text">
            <div>{{ text }}</div>
            <div>{{ record.modifyTime }}</div>
          </div>
          <div v-else>-</div>
        </span>
        <!-- 状态 {待审:0 ,正常:1, 删除:2, 审核不通过:3, 下线: 4} -->
        <span slot="auditStatus" slot-scope="text, record">
          <a-tag color="blue" v-if="record.status == 0">待审核</a-tag>
          <a-tag color="green" v-else-if="record.status == 1">已通过</a-tag>
          <a-tag color="pink" v-else-if="record.status == 2">已删除</a-tag>
          <a-tag color="#d81e06" v-else-if="record.status == 3">不通过</a-tag>
        </span>
        <span slot="action" slot-scope="text, record, index">
          <template>
            <a-tooltip title="查看">
              <a-button shape="circle" icon="eye" @click="EditInfo(record, 1)"></a-button>
            </a-tooltip>
            <a-tooltip title="基本信息">
              <a-button shape="circle" icon="form" @click="EditInfo(record, 3)"></a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button shape="circle" icon="delete" @click="OnDelete(record.id)"></a-button>
            </a-tooltip>
            <a-tooltip title="医生观点">
              <a-button shape="circle" icon="bulb" @click="handleOpenSelectLabModal(record, 'art')"></a-button>
            </a-tooltip>
          </template>
        </span>
      </a-table>
    </div>
    <!-- 底部 -->
    <div class="custom-page-view-footer" ref="footer">
      <div class="custom-page-view-operation">
        <a-button @click="addDieaseWording" type="primary">
          新增词条
        </a-button>

        <a-popconfirm placement="topLeft" title="确认审核通过？" @confirm="examine" okText="确认" cancelText="取消">
          <a-button class="bbar-a" icon="check" :disabled="!hadSelected" v-show="queryParams.status == '0'">
            审核通过</a-button
          >
        </a-popconfirm>
        <a-button
          class="bbar-a"
          @click="auditFailed"
          icon="close"
          :disabled="!hadSelected"
          v-show="queryParams.status == '0'"
          >审核不通过</a-button
        >
        <a-button
          @click="online"
          class="bbar-a"
          icon="arrow-up"
          :disabled="!hadSelected"
          v-show="queryParams.isOffline == 'true'"
          >点我上线</a-button
        >
        <a-popconfirm placement="topLeft" title="确认下线？" @confirm="Offline" okText="确认" cancelText="取消">
          <a-button class="bbar-a" icon="arrow-down" :disabled="!hadSelected" v-show="queryParams.isOffline == 'false'"
            >点我下线</a-button
          >
        </a-popconfirm>
        <a-popconfirm placement="topLeft" title="确认删除？" @confirm="OnDelete(-1)" okText="确认" cancelText="取消">
          <a-button
            class="bbar-a"
            icon="delete"
            :disabled="!hadSelected"
            v-show="queryParams.status == '' || queryParams.status === '3' || queryParams.status === '0'"
            >删除</a-button
          >
        </a-popconfirm>
      </div>
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

    <!-- 基本信息弹窗 -->
    <a-drawer
      :title="formTitle"
      :visible="infovisibleForm"
      centered
      width="80%"
      :maskClosable="true"
      @close="handleCloseForm"
      :footer="null"
    >
      <WandingIllnessInfo :item="currentid" ref="WandingIllnessInfo" @close="handleCloseForm"></WandingIllnessInfo>
    </a-drawer>
    <a-modal
      :title="formTitle"
      :visible="visibleFormExamine"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
    >
      <a-form>
        <a-form-item label="不通过原因">
          <a-textarea placeholder="请输入审核不通过原因" v-model="reason" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleCloseForm">取消</a-button>
          <a-button type="primary" @click="handleOk(reason)">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      :title="formTitle"
      :visible="visibleFormOffline"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
    >
      <a-form>
        <a-form-item label="下线原因">
          <a-textarea placeholder="请输入下线原因" v-model="reason" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleCloseForm">取消</a-button>
          <a-button type="primary" @click="clickOffline(reason)">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 医生观点 -->
    <a-modal :title="formTitle" width="80%" v-model="WordsisShow" @cancel="handleCloseForm" :footer="null" centered>
      <DoctorViewPoint ref="labList" :name="currentName"></DoctorViewPoint>
    </a-modal>
  </div>
</template>

<script>
import apiProgram from '@/api/apiProgram'
import moment from 'moment'
import qs from 'qs'
import { Button } from 'ant-design-vue'
import WandingIllnessInfo from './WandingIllnessInfo'
import { formatSecondsShow } from '@/utils/util'
import commonListView from '@/mixins/commonListView'
import DoctorViewPoint from '../Lab/DoctorViewPoint'
const columns = [
  {
    title: '词条id',
    dataIndex: 'id',
    width: '80px'
  },
  {
    title: '词条名称',
    dataIndex: 'name',
    key: 'name',
    width: '120px'
  },
  {
    title: '流览数',
    dataIndex: 'viewCount',
    key: 'viewCount',
    width: '200px'
  },
  {
    title: '上下线状态',
    dataIndex: 'isOffline',
    width: '100px',
    scopedSlots: { customRender: 'isOffline' }
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'auditStatus' },
    width: '100px'
  },

  {
    title: '创建人及时间',
    dataIndex: 'createUser',
    width: '200px',
    scopedSlots: { customRender: 'createUser' }
  },

  {
    title: '修改人与修改时间',
    dataIndex: 'modifyUser',
    width: '200px',
    scopedSlots: { customRender: 'modifyUser' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '200px',
    scopedSlots: { customRender: 'action' }
  }
]
export default {
  components: {
    WandingIllnessInfo,
    DoctorViewPoint
  },
  name: 'HospitalList',
  data() {
    return {
      count_unverify: '0',
      count_verifyfailed: '0',
      formItemSize: 'default',
      formadd: this.$form.createForm(this, { name: 'formadd' }),
      dataSource: [],
      tempform: [],
      selectedRowKeys: [],
      currentid: {},
      current: [''],
      breadcrumbList: [],
      dataList: [],
      // 主数据是否加载中
      dataLoading: false,
      // 查询条件
      queryParams: {
        status: '',
        modifyUser: '',
        isOffline: null
      },
      // 表格
      columns,
      pageSize: 10,
      pageIndex: 1,
      dataCount: 0,
      changePage: false,
      // 上下线ids
      ids: [],
      // 表单title
      formTitle: '',
      // 图集
      visibleForm: false,
      // 基本信息
      infovisibleForm: false,
      visibleFormExamine: false,
      visibleFormOffline: false,
      reason: '',
      add: true, // 新增词条
      del: true, // 删除
      line: false, // 上线
      off: false, // 下线
      no: false, // 审核不通过
      yes: false, // 审核通过
      WordsisShow: false, //医生观点显示
      ps: {}, // 请求参数
      headers: {
        authorization: 'authorization-text',
        'Content-Type': ''
      },
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 16 }
      },
      currentName: '' //查询疾病名
    }
  },
  mixins: [commonListView],
  created() {
    this.breadcrumbList = this.$route.matched
    this.loadData()
  },
  watch: {
    $route(to, from) {
      this.breadcrumbList = to.matched
    }
  },

  computed: {
    // 是否已选中任何数据
    hadSelected() {
      return this.selectedRowKeys.length > 0
    }
  },
  methods: {
    moment,
    onChange(date, dateString) {
      this.queryParams.startTime = dateString[0]
      this.queryParams.endTime = dateString[1]
    },
    loadData() {
      const ps = {
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        ...this.queryParams
      }

      this.dataLoading = true

      apiProgram
        .getDiseaseword(ps)
        .then(res => {
          this.dataLoading = false
          if (res.code === 200) {
            this.dataList = res.data.items.map(v => {
              if (v.modifyTime) {
                v.modifyTime = this.SetTime(v.modifyTime)
              }
              if (v.createTime) {
                v.createTime = this.SetTime(v.createTime)
              }
              if (v.auditTime) {
                v.auditTime = this.SetTime(v.auditTime)
              }
              return v
            })
            this.dataCount = res.data.itemCount
            this.changePage = false
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
      apiProgram.getDiseaseword({ ...ps, status: 0, isOffline: '' }).then(res => {
        this.count_unverify = res.data.itemCount
      })
      apiProgram.getDiseaseword({ ...ps, status: 3, isOffline: '' }).then(res => {
        this.count_verifyfailed = res.data.itemCount
      })
    },
    // 设置时间
    SetTime(value) {
      const d = new Date(value)
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      const hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours()
      const min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
      const sec = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
      const times = d.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec
      return times
    },
    // 切换顶部数据状态
    handleTurnStatus(key) {
      switch (key.key) {
        case 'on':
          this.queryParams.status = ''
          this.queryParams.isOffline = 'false'
          this.pageIndex = 1
          break
        case 'off':
          this.queryParams.status = ''
          this.queryParams.isOffline = 'true'
          this.pageIndex = 1
          break
        default:
          this.queryParams.isOffline = ''
          this.queryParams.status = key.key
          this.pageIndex = 1
          break
      }
      this.loadData(1)
    },
    // 重置
    handleResect() {
      this.queryParams = { labId: 0, status: '', modifyUser: '' }
      this.pageIndex = 1
      this.loadData()
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
    onSelectChange(record, selected, selectedRows) {
      this.selectedRowKeys = selected
      this.ids = selected.map(v => {
        return v.id
      })
      this.ids = this.ids.join(',')
    },

    // 上线
    online() {
      const ps = {
        ids: this.ids
      }
      apiProgram
        .GetOffline(ps)
        .then(res => {
          this.dataLoading = true
          if (res.code === 200) {
            this.$message.success(`已上线`)
            this.loadData()
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
      this.dataLoading = false
    },
    // 下线
    Offline() {
      this.visibleFormOffline = true
      this.formTitle = '是否确认下线'
    },
    clickOffline(reason) {
      this.dataLoading = true
      const ps = {
        ids: this.ids,
        reason: reason
      }
      apiProgram
        .GetOffline(ps)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(`已下线`)
            this.loadData()
            this.visibleFormOffline = false
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(`load user err: ${err.message}`)
        })
    },
    // 删除
    OnDelete(i) {
      let data
      if (i !== -1) {
        data = i
      } else {
        data = this.ids
      }
      apiProgram
        .GetDelete({ ids: data })
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
    // 审核通过
    examine() {
      this.dataLoading = true
      const ps = {
        ids: this.ids
      }
      apiProgram
        .PutDepartmentaudit(ps)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(`审核通过`)
            this.loadData()
          }
        })
        .catch(err => {
          this.dataLoading = false
          this.$message.error(err)
        })
      this.dataLoading = false
    },
    // 审核不通过
    auditFailed() {
      this.formTitle = '是否确认审核不通过'
      this.visibleFormExamine = true
    },
    // 确定审核不通过
    handleOk(reason) {
      if (reason) {
        this.dataLoading = true
        const ps = {
          ids: this.ids,
          reason: reason
        }
        apiProgram
          .PutDepartmentaudit(ps)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(`审核不通过`)
              this.visibleFormExamine = false
              this.loadData()
            }
          })
          .catch(err => {
            this.dataLoading = false
            this.$message.error(`load user err: ${err.message}`)
          })
        this.dataLoading = false
      } else {
        this.$message.warning('请输入审核不通过原因')
      }
    },
    // 新增
    addDieaseWording() {
      this.currentid.id = 0
      this.infovisibleForm = true
      this.formTitle = '新增疾病词条'
    },

    handleCloseForm() {
      this.visibleForm = false
      this.infovisibleForm = false
      this.visibleFormExamine = false
      this.visibleFormOffline = false
      this.WordsisShow = false
      setTimeout(() => {
        this.$refs.WandingIllnessInfo.init()
      }, 500);
      
      this.loadData()
    },
    //显示关联
    handleOpenSelectLabModal(item, str) {
      switch (str) {
        case 'art':
          this.WordsisShow = true
          this.formTitle = item.name + '基本信息'
          this.currentName = item.name
          setTimeout(() => {
            this.$refs.labList.queryParams.diseaseWordId = item.id
            this.$refs.labList.queryParams.dictionaryId = null
            this.$refs.labList.loadData()
            
          }, 500)
          break

        default:
          break
      }
    },
    // 基本信息
    EditInfo(record, i) {
      record.type = i
      this.infovisibleForm = true
      this.formTitle = record.name + '-基本信息'
      this.currentid = { ...record }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../layouts/CustomListViewStyle.less';
.search-wrap {
  margin-bottom: 20px;
}
.bbar-wrap {
  margin-top: 20px;
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
.bbar-a {
  margin-right: 15px;
  margin-left: 0px;
}
.hosImg {
  height: 70px;
}
.hospitalName {
  width: 100px;
  word-break: break-word;
}
.labname {
  word-break: break-word;
}
// 批量信息上传
.custom-page-view-operation > * {
  margin-right: 10px;
}
.ant-upload-list {
  display: inline-block;
  vertical-align: sub;
}
.ant-badge-not-a-wrapper {
  vertical-align: super;
}
.ant-dropdown-menu > * {
  display: block;
  margin: 10px;
}
</style>
