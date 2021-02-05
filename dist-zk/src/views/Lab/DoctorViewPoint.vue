<template>
  <div>
    <div class="search-wrap">
      <div v-for="d in relatedLabs" :key="d.id" class="hospitaltag" :title="`${d.hospitalName}-${d.labName}`">
        {{ d.hospitalName }}-{{ d.labName }}
        <a-icon type="close" class="iconx" @click="hangeleDelete1(d)" />
      </div>

      <a-row style="margin-bottom: 20px;">
        <a-col :md="8"> 词条id:<a-input style="width: 200px;" v-model="queryParams.diseaseWordId" /> </a-col>
        <a-col :md="8">
          选择一级分类:
          <a-select v-model="queryParams.dictionaryId" style="width: 200px;">
            <a-select-option :value="item.id" v-for="(item, index) in dicManage" :key="item.id">
              {{ item.name }}-{{item.id}}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :md="8"> 文章id:<a-input style="width: 200px;" v-model="queryParams.articleId" placeholder /> </a-col>
      </a-row>
      <a-row>
        <a-col :md="8"> 文章标题:<a-input style="width: 200px;" v-model="queryParams.title" /> </a-col>

        <a-col :md="8">
          是否前端展示:<a-select v-model="queryParams.isShow" style="width: 100px;">
            <a-select-option :value="item.id" v-for="(item, index) in isShow" :key="item.id">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-col>
         <a-col :md="8">
          <a-button type="primary" icon="search" @click="loadData">查询</a-button>
          <a-button :size="formItemSize" icon="redo" style="margin-left: 8px" @click="handleResect">重置</a-button>
        </a-col>
      </a-row>
    </div>
    <div class="data-wrap">
      <a-button type="primary" @click="handleAdd" style="margin-bottom:30px">
        添加
      </a-button>
      <a-table size="small" :columns="columns" :dataSource="dataList" :loading="dataLoading" :pagination="false">
        <!--修改时间 -->
        <span slot="modifyEndTime" slot-scope="text, record">
          <div v-if="record.modifyEndTime">
            <p>{{ record.modifyUser }}</p>
            <p>{{ record.modifyEndTime }}</p>
          </div>
          <div v-else>--</div>
        </span>
        <!-- 操作 -->
        <span slot="action" slot-scope="text, record">
          <template>
            <a-tooltip title="查看">
              <a-button shape="circle" icon="eye" @click="EditInfo(record, 1)"></a-button>
            </a-tooltip>
            <a-tooltip title="基本信息">
              <a-button shape="circle" icon="form" @click="EditInfo(record, 3)"></a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button shape="circle" icon="delete" @click="onDelete(record.id)"></a-button>
            </a-tooltip>
          </template>
        </span>
      </a-table>
      <a-pagination
        style="margin-top:10px;"
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
    <a-modal
      :title="formTitle"
      :visible="isCms"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
      width="80%"
    >
      <cms @save="handleSave" :selectedDiseases="dataItemList"></cms>
      <!-- -->
    </a-modal>
    <!-- 编辑展示 -->
    <a-drawer width="1000" :visible="isShowOutcallForm" @close="handleCloseForm" title="添加文章">
      <a-tag
        v-if="!disabled"
        @click="handleOpenSelectLabModal"
        style="background: #fff; borderStyle: dashed; margin:0 0 20px; "
      >
        <a-icon type="plus" />关联文章
      </a-tag>
      <template v-if="dataItemList.length > 0">
        <div>
          <!-- 内容区域 -->
          <div class="box">
            <div class="title">
              <div class="px">文章id</div>
              <div class="bt">文章标题</div>
              <div class="pc">提取内容</div>
              <div class="wap">是否前端展示</div>
            </div>
            <div class="content" v-for="(item, index) in dataItemList" :key="item.id">
              <a-input :disabled="disabled" v-model="item.articleId" class="a_px" @blur="handleChangeValue(item)" />
              <a-textarea
                :disabled="disabled"
                v-model="item.title"
                :title="item.title"
                class="a_bt input"
                @blur="handleChangeValue(item)"
              />
              <a-textarea
                :disabled="disabled"
                v-model="item.summarize"
                class="a_pc input"
                @blur="handleChangeValue(item)"
              />
              <a-select :disabled="disabled" v-model="item.isShow" class="a_wap input" :default-value="1">
                <a-select-option :value="0">全部</a-select-option>
                <a-select-option :value="1">是</a-select-option>
                <a-select-option :value="2">否</a-select-option>
              </a-select>
              <a-icon type="close" style="transform: translateY(10px);" @click="handleDelItem(item)" />
            </div>
          </div>
          <div style="height:50px"></div>
          <div class="drawer-footer-action" v-if="!disabled">
            <a-button @click="handleCloseForm" icon="rollback">取消</a-button>
            <a-button @click="handleSubmit" icon="check" type="primary">保存</a-button>
          </div>
        </div>
      </template>
    </a-drawer>
  </div>
</template>
<script>
import apiProgram from '@/api/apiProgram'
import cms from '../Components/cms'
import apiDicManage from '@/api/apiDicManage'
export default {
  name: 'DoctorViewPoint',
  components: {
    cms
  },

  data() {
    return {
      //医院列表
      dataList: [],
      dataCount: [], // 数据总数
      pageSize: 10,
      pageIndex: 1,
      // 主数据是否加载中
      dataLoading: false,
      // 查询条件
      isShowOutcallForm: false,
      queryParams: {
        diseaseWordId: '', //词条id
        dictionaryId: null, //页面类型
        articleId: null, //文章id
        title: '', //文章标题
        isShow: null, //是否前端显示
        modifyUser: '', //最后修改人
        modifyStartTime: '', //开始修改时间
        modifyEndTime: '' //结束修改时间
      },
      isShow: [{ id: 0, name: '全部' }, { id: 1, name: '是' }, { id: 2, name: '否' }],
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 16 }
      }, // 查询条件表单布局设置

      formTitle: '', //标题
      columns: [
        {
          title: '词条id',
          dataIndex: 'diseaseWordId',
          width: '80px',
          key: 'diseaseWordId'
        },
        {
          title: '分类类型',
          dataIndex: 'dictionaryId',
          key: 'dictionaryId',
          width: '80px'
        },
        {
          title: '文章id',
          dataIndex: 'articleId',
          key: 'articleId',
          width: '100px'
        },
        {
          title: '标题',
          dataIndex: 'title',
          key: 'title',
          width: '100px'
        },
        {
          title: '内容',
          dataIndex: 'summarize',
          key: 'summarize',
          width: '100px'
        },

        {
          title: '是否前端显示',
          dataIndex: 'isShow',
          key: 'isShow',
          width: '60px'
        },
        {
          title: '开始修改时间',
          dataIndex: 'modifyStartTime',
          key: 'modifyStartTime',
          width: '60px'
        },
        {
          title: '最后编辑人和时间',
          width: '60px',
          scopedSlots: { customRender: 'modifyEndTime' }
        },
        {
          title: '操作',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      currentItem: { id: 0, type: 0 },
      detailData: {}, //详情数据
      relatedLabs: [], //关联数据
      isCms: false,
      addInfo: false,
      filterData: {},
      dataItemList: [],
      dataLoading: false,
      dataSoure: {},
      num: 1,
      pagetype: [],
      formadd: this.$form.createForm(this, { name: 'formadd' }),
      currentId: 0,
      dicManage: [] // 词典
    }
  },
  computed: {
    disabled() {
      return this.currentItem.type == 1
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.loadDictionary()
    })
  },
  methods: {
    // 加载列表数据
    loadData() {
      let ps = {
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        ...this.queryParams
      }
      this.dataLoading = true
      apiProgram
        .DoctorsView(ps)
        .then(res => {
          this.dataLoading = false
          if (res.code === 200) {
            this.dataList = res.data.items.map(v => {
              v.isShow = v.isShow == 1 ? '是' : v.isShow == 0 ? '全部' : '否'
              return v
            })
            this.dataCount = res.data.itemCount
          }
        })
        .catch(err => {})
    },
    handleResect(){
      this.queryParams={}
      this.loadData()
    },
    // 加载词典数据
    loadDictionary() {
      apiDicManage
        .getCategory()
        .then(res => {
          if (res.code == 200) {
            this.dicManage = res.data.items[0].items.map(v => {
              let obj = { id: v.id, name: v.name, order: v.order }
              return obj
            })
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    onPageIndexChange(page, pageSize) {
      this.pageIndex = page
      this.loadData()
    },

    handleCloseForm() {
      this.isShowOutcallForm = false
      this.isCms = false
    },
    handleAdd() {
      this.form.setFieldsValue({
        doctorPost: '',
        diseaseWorldId: '',
        dictionaryId: '',
        articleId: '',
        title: '',
        articleUrl: '',
        doctorName: '',
        doctorLabName: '',
        summarize: '',
        isShow: 0
      })
      this.formTitle = '添加'
      this.isShowOutcallForm = true
      this.addInfo = false
    },
    EditInfo(item, i) {
      this.formTitle = item.title + '基本信息'
      this.isShowOutcallForm = true
      this.currentItem.dictionaryId = item.dictionaryId
      this.currentItem.diseaseWordId = item.diseaseWordId
      this.currentItem.type = i
      this.currentId = item.id
      this.loadDataDetail()
    },
    loadDataDetail() {
      let ps = {}
      ps.dictionaryId = this.currentItem.dictionaryId
      ps.diseaseWordId = this.currentItem.diseaseWordId
      apiProgram.DoctorsView(ps).then(res => {
        if (res.code == 200) {
          this.dataItemList = [...res.data.items]
        }
      })
    },
    handleOpenSelectLabModal() {
      this.isCms = true
    },
    handleSave(data) {
      data = data.map(v => {
        v.diseaseWordId = this.queryParams.diseaseWordId
        v.dictionaryId = this.queryParams.dictionaryId
        return v
      })
      this.dataItemList = [...data]

      this.isCms = false
    },
    // 删除关联科室
    hangeleDelete1(item) {
      let id = item.id
      var i = 0
      this.relatedLabs.map((v, index) => {
        if (v.id == id) {
          i = index
        } else {
          return v
        }
      })
      this.relatedLabs.splice(i, 1)
    },
    onDelete(id) {
      this.dataLoading = true
      apiProgram
        .deleteDoctorsViewById(id)
        .then(res => {
          if (res.code == 200) {
            this.dataLoading = false
            this.$message.success('操作成功')
            this.loadData()
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    // 编辑
    handleSubmit() {
      if (this.currentId) {
        this.dataItemList.id = this.currentId
      }
      apiProgram
        .editDoctorsView(this.dataItemList)
        .then(res => {
          if (res.code == 200) {
            this.$message.success('操作成功。')
            this.handleCloseForm()
            this.dataItemList = []
            this.loadData()
          }
        })
        .catch(err => {
          this.$message.warning(err.message)
        })
    },

    // 删除
    handleDelItem(item) {
      let id = item.id
      let j = 0
      this.dataItemList.map((v, index) => {
        if (v.id == id) {
          j = index
        }
      })
      this.dataItemList.splice(j, 1)
    },
    // 编辑文本
    handleChangeValue(item) {
      if (item.articleId) {
        let articleId = item.articleId
        let j = 0
        this.dataItemList.map((v, index) => {
          if (v.articleId == articleId) {
            j = index
          }
        })
        this.dataItemList.splice(j, 1)
        this.dataItemList.splice(j, 0, item)
      } else {
        let num = item.num
        let j = 0
        this.dataItemList.map((v, index) => {
          if (v.num == num) {
            j = index
          }
        })
        this.dataItemList.splice(j, 1)
        this.dataItemList.splice(j, 0, item)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.data-wrap {
  margin-top: 10px;
}

.footer {
  display: flex;
  justify-content: space-between;
}
/deep/ .ant-input-search-enter-button .ant-input-group-addon .ant-input-search-button {
  width: 100%;
  margin: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.title {
  display: flex;
  height: 50px;
  background: rgb(242, 242, 242);
  font-weight: 600;
  line-height: 50px;
  text-align: center;
  .px {
    width: 8%;
    margin-left: 20px;
  }
  .bt {
    width: 26%;
  }
  .pc {
    width: 33%;
  }
  .wap {
    width: 33%;
  }
}
.content {
  display: flex;
  margin-top: 20px;
  .input {
    margin-left: 20px;
  }
  .a_px {
    width: 8%;
    margin-left: 20px;
  }
  .a_bt {
    width: 19%;
  }
  .a_pc {
    width: 47%;
  }
  .a_wap {
    width: 10%;
    margin-right: 20px;
  }
}
</style>
