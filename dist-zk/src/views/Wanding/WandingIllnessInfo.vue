<template>
  <div class="bodyForm">
    <a-tag
      v-if="!look"
      @click="handleOpenSelectLabModal"
      style="background: #fff; borderStyle: dashed; margin:0 0 20px; "
    >
      <a-icon type="plus" />关联词条
    </a-tag>
    <div v-if="relatedDiseaseWordList">
      <a-tag
        class="pr"
        v-for="(item, i) in relatedDiseaseWordList"
        :key="item.id"
        :title="item.name + '  ' + item.order"
      >
        <span :class="item.type == 1 ? 'current' : ''"> {{ item.name }}--{{ item.order }} </span>
        <a-icon type="close" class="r_DWordList_close" @click="r_DWordList_close(i)"></a-icon>
      </a-tag>
    </div>
    <a-form :form="form" layout="inline">
      <div class="base-info">
        <div class="base-info-form">
          <a-row>
            <a-col :md="12">
              <a-form-item label="名称">
                <a-input
                  :disabled="look"
                  v-decorator="[
                    'name',
                    {
                      rules: [
                        {
                          required: true,
                          message: '请输入疾病名称'
                        }
                      ]
                    }
                  ]"
                />
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item :labelCol="{ span: 10 }" :wrapperCol="{ span: 14 }" label="别名">
                <a-select
                  :disabled="look"
                  mode="tags"
                  :size="size"
                  v-decorator="['alias']"
                  style="width: 350px"
                ></a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :md="24">
              <a-form-item label="涉及部位">
                <a-tree-select
                  :disabled="look"
                  style="width: 500px"
                  :tree-data="treeDataPart"
                  search-placeholder="Please select"
                  multiple
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  v-decorator="['relatedBodyList', { rules: [{ required: true, message: '请选择' }] }]"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="24">
              <a-form-item label="涉及科室">
                <a-tree-select
                  style="width: 500px"
                  :tree-data="treeDataLab"
                  :disabled="look"
                  search-placeholder="Please select"
                  multiple
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  v-decorator="['relatedDeptList', { rules: [{ required: true, message: '请选择' }] }]"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="24">
              <div style="display:flex;margin-top:20px">
                <a-tag
                  @click="handkeSelectDocItem"
                  class="bg"
                  style="background: #fff; borderStyle: dashed; margin:0 20px 20px; 0"
                >
                  <a-icon type="plus" />添加审核医生
                </a-tag>
                <div v-if="yskDoctorList">
                  <a-tag class="pr" v-for="(item, i) in yskDoctorList" :key="item.id" :title="item.doctorName">
                    {{ item.doctorName }}
                    <a-icon type="close" class="r_DWordList_close" @click="DWordList_close(i)"></a-icon>
                  </a-tag>
                </div>
                <div>
                  前端显示
                  <a-checkbox :disabled="look" v-model="isShowDoctor"></a-checkbox>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
      <a-divider orientation="left" class="bg">
        内容分类
      </a-divider>
      <div style="text-align:center;color:#f00;">请点击下方选中对象，再添加同级或子级</div>
      <div class="form">
        <a-button type="primary" @click="handleAddList" v-show="contentList.length == 0">添加内容</a-button>
        <div class="addchildren" v-show="contentList.length > 0 && !look">
          <span v-if="contentList.length > 0 && tmpItem" @click="handleAddItem">添加同级</span>
          <span v-if="contentList.length > 0 && tmpItem && issziji" @click="handleAddSublist">添加子级</span>
        </div>
        <div class="contentList-content" ref="contentArr" v-show="contentList.length > 0">
          <div class="contentList-content-item" v-for="(item, index) in contentList" :key="item.title">
            <div class="yi" @click="handleSelectFirst(item, index, 1)">
              <span
                >标题：<a-input :disabled="look" class="textarea" v-model="item.title" @click.stop="handleEye(item)" />
              </span>
              <span
                >内容：<a-textarea :disabled="look" class="textarea" v-model="item.content" @click="handleEye(item)" />
              </span>
            </div>
            <a-icon type="close" class="handleclose" @click="handlecloseDel(item)"></a-icon>
            <!-- <a-icon type="edit" class="handleeye" @click="handleEye(item)"></a-icon> -->
            <!-- v-if="firstIndex == index"  -->
            <div class="contentList-content-chird">
              <div v-for="(item2, index2) in item.subList" style="position:relative;" :key="item2.title">
                <div class="contentList-content-chird-item" @click="handleSelectSec(item2, index2)">
                  <span>
                    标题：<a-input
                      :disabled="look"
                      class="textarea"
                      v-model="item2.title"
                      @click.stop="handleEye(item2)"
                  /></span>
                  <span>
                    内容：<a-textarea
                      :disabled="look"
                      class="textarea"
                      v-model="item2.content"
                      @click.stop="handleEye(item2)"
                  /></span>
                </div>
                <a-icon type="close" class="handleclose" @click="handlecloseDel(item2)"></a-icon>
                <!-- <a-icon type="edit" class="handleeye" @click="handleEye(item2)"></a-icon> -->
                <!-- v-if="secondIndex == index2" -->
                <div class="contentList-content-chird">
                  <div v-for="(item3, index3) in item2.subList" style="position:relative;" :key="item3.title">
                    <div class="contentList-content-chird-item" @click="handleSelectThird(item3, index3)">
                      <span>
                        标题：<a-input
                          :disabled="look"
                          class="textarea"
                          v-model="item3.title"
                          @click.stop="handleEye(item3)"
                      /></span>
                      <span>
                        内容：<a-textarea
                          :disabled="look"
                          class="textarea"
                          v-model="item3.content"
                          @click.stop="handleEye(item3)"
                      /></span>
                    </div>
                    <a-icon type="close" class="handleclose" @click="handlecloseDel(item3)"></a-icon>
                    <!-- <a-icon type="edit" class="handleeye" @click="handleEye(item3)"></a-icon> -->
                    <div class="contentList-content-chird">
                      <div v-for="(item4, index4) in item3.subList" style="position:relative;" :key="item4.title">
                        <div class="contentList-content-chird-item" @click="handleSelectFour(item4, index4)">
                          <span>
                            标题：<a-input
                              :disabled="look"
                              class="textarea"
                              v-model="item4.title"
                              @click.stop="handleEye(item4)"
                          /></span>
                          <span>
                            内容：<a-textarea
                              :disabled="look"
                              class="textarea"
                              v-model="item4.content"
                              @click.stop="handleEye(item4)"
                          /></span>
                        </div>
                        <a-icon type="close" class="handleclose" @click="handlecloseDel(item4)"></a-icon>
                        <!-- <a-icon type="edit" class="handleeye" @click="handleEye(item4)"></a-icon> -->
                        <div class="contentList-content-chird">
                          <div v-for="(item5, index5) in item4.subList" style="position:relative;" :key="item5.title">
                            <div class="contentList-content-chird-item" @click="handleSelectFive(item5, index5)">
                              <span>
                                标题：<a-input
                                  :disabled="look"
                                  class="textarea"
                                  v-model="item5.title"
                                  @click.stop="handleEye(item5)"
                              /></span>
                              <span>
                                内容：<a-textarea
                                  :disabled="look"
                                  class="textarea"
                                  v-model="item5.content"
                                  @click.stop="handleEye(item5)"
                              /></span>
                            </div>
                            <a-icon type="close" class="handleclose" @click="handlecloseDel(item5)"></a-icon>
                            <!-- <a-icon type="edit" class="handleeye" @click="handleEye(item5)"></a-icon> -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a-divider orientation="left" class="bg">
        图片
      </a-divider>
      <div class="clearfix">
        <a-upload
          action="http://zk-mg-test.39.net/api/v1/uploadimg"
          multiple
          listType="picture-card"
          :showUploadList="false"
          :customRequest="customRequest"
          :disabled="look"
        >
          <div>
            上传图片
          </div>
        </a-upload>
        <div v-if="look" class="imgList">
          <div v-for="(v, i) in imgList" :key="i" class="pr">
            <img :src="v" alt="" />
          </div>
        </div>

        <div v-if="imgList.length > 0 && !look" class="imgList">
          <div v-for="(v, i) in imgList" :key="i" @click="handleIndex(i)" class="pr">
            <a-upload
              action="http://zk-mg-test.39.net/api/v1/uploadimg"
              listType="picture-card"
              :showUploadList="false"
              :customRequest="recustomRequest1"
            >
              <img :src="v" alt="" />
            </a-upload>
            <a-icon class="close" type="close" @click="handleRemove(i)"></a-icon>
          </div>
        </div>
      </div>
      <a-divider orientation="left">
        视频
      </a-divider>

      <a-form-item label="存放地址：">
        <a-input :disabled="look" v-decorator="['videoUrl']" style="width:500px" type="text" />
        <a-button style="margin-left:30px;display:none" v-if="!look">上传</a-button>
      </a-form-item>
      <a-divider orientation="left">
        音频
      </a-divider>
      <a-form-item label="存放地址：">
        <a-input :disabled="look" style="width:500px" type="text" v-decorator="['audioUrl']" />
        <a-button style="margin-left:30px;display:none" v-if="!look">上传</a-button>
      </a-form-item>
      <a-divider orientation="left">
        其他信息
      </a-divider>
      <a-form-item label="病种">
        <a-checkbox-group
          :disabled="look"
          v-decorator="[
            'diseaseTagList',
            {
              rules: [
                {
                  required: true,
                  message: '请选择病种'
                }
              ]
            }
          ]"
          name="checkboxgroup"
          :options="value"
        />
      </a-form-item>
      <br />
      <a-form-item label="是否医保">
        <a-radio-group :disabled="look" :options="yb" v-model="isMedicare" /> <br /> </a-form-item
      ><br />
      <a-form-item label="遗传性"> <a-radio-group :disabled="look" :options="ycx" v-model="isGenetic" /> </a-form-item
      ><br />
      <a-form-item label="潜伏性" style="margin-bottom:50px">
        <a-radio-group :disabled="look" :options="qfx" v-model="isLatency" />
        <!-- 潜伏周期 -->
        <a-input
          v-if="isLatency"
          :disabled="look"
          type="text"
          style="width:100px"
          placeholder="请输入潜伏周期"
          v-model="latenncyPeriod"
        />
        <!-- 时间 -->
        <a-select
          :disabled="look"
          v-if="isLatency"
          style="width:100px;margin-left:15px"
          v-model="latenncyPeriodUnit"
          default-value="天"
        >
          <a-select-option value="天">天</a-select-option>
          <a-select-option value="周">周</a-select-option>
          <a-select-option value="月">月</a-select-option>
          <a-select-option value="年">年</a-select-option>
        </a-select>
      </a-form-item>
      <br />
    </a-form>

    <div class="drawer-footer-action" v-if="!look">
      <a-button @click="handleCancel" icon="rollback">取消</a-button>
      <a-button @click="handleSubmit" icon="check" type="primary">保存</a-button>
    </div>

    <!-- 添加级 -->
    <a-modal
      :title="formTitle"
      :visible="isAddItem"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
    >
      <div>标题：<a-input v-model="currentItem.title" /></div>
      <div>内容：<a-textarea :rows="4" v-model="currentItem.content" /></div>
      <div class="modal_b">
        <a-button @click="handleCloseForm">取消</a-button>
        <a-button type="primary" @click="handleSibling">提交</a-button>
      </div>
    </a-modal>
    <!-- 关联词条 -->
    <a-modal
      title="关联词条"
      :visible="wordingsShow"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
      width="60%"
    >
      <wordingList @save="handleSave" :selectedDiseases="relatedDiseaseWordList"></wordingList>
    </a-modal>
    <!-- 选中审核医生 -->
    <a-modal
      title="选中审核医生"
      :visible="selectDocShow"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
      width="80%"
    >
      <selectDoc :selectedDoc="yskDoctorList" @save="handleSaveDoc"></selectDoc>
    </a-modal>
    <!-- 选中字典 -->
    <a-modal
      title="选中字典"
      :visible="isDic"
      centered
      :maskClosable="true"
      @cancel="handleCloseForm"
      :footer="null"
      width="80%"
    >
      <a-tree-select
        style="width: 500px"
        :tree-data="treeDataDic"
        search-placeholder="Please select"
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        @select="onhandleselect"
        :replaceFields="replaceFields"
      />
    </a-modal>
    <!-- 展示内容 -->
    <a-modal
      :title="editItem.title + '--基本信息'"
      :visible="isShowContent"
      centered
      :maskClosable="false"
      @cancel="handleCloseForm"
      :footer="null"
    >
      <div>标题：<a-textarea v-model="editItem.title" /></div>
      <div>内容：<a-textarea v-model="editItem.content" /></div>
      <a-button @click="handleEditEye" type="primary" style="margin:20px auto;">确定</a-button>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'
import apiProgram from '@/api/apiProgram'
import VDistpicker from 'v-distpicker'
import { formatSecondsShow } from '@/utils/util'
import wordingList from '../Components/wordingList'
import selectDoc from '../Components/selectDoc'
import apiBase from '@/api/apiBase'
import apiDicManage from '@/api/apiDicManage'
import $ from 'jquery'
import { TreeSelect } from 'ant-design-vue'
export default {
  components: {
    VDistpicker,
    wordingList,
    selectDoc
  },

  data() {
    return {
      dataSource: [],
      yskDoctorListTree: [], //审核医生列表
      yskDoctorList: [], //推送，接受医生列表
      isShowEdit: false,
      // isAddSublist: false,
      isAddItem: false,
      selectDocShow: false, //选中审核医生
      isShow: null,
      itemIndex: 0, //索引
      subListIndex: 0, //索引
      tmpCurrentItem: {}, //当前项
      contentList: [], //内容数据
      formTitle: '',
      currentIndex: -1,
      currentItem: {},
      firstIndex: -1,
      secondIndex: -1,
      thirdIndex: -1,
      size: 'default',
      previewImage: '',
      imgList: [], //图片集合imgList1
      imgList1: [], //图片集合imgList1
      videoUrl: '', //视频链接
      audioUrl: '', //视频链接
      value: [
        {
          label: '常见病',
          value: '常见病'
        },
        {
          label: '罕见病',
          value: '罕见病'
        },
        {
          label: '职业病',
          value: '职业病'
        },
        {
          label: '传染病',
          value: '传染病'
        }
      ],
      yb: [{ label: '是', value: true }, { label: '否', value: false }], //医保
      isMedicare: 0, //医保
      ycx: [{ label: '是', value: true }, { label: '否', value: false }], //遗传性
      isGenetic: 0,
      qfx: [{ label: '是', value: true }, { label: '否', value: false }], //潜伏期
      isLatency: 0,
      latenncyPeriod: 0,
      latenncyPeriodUnit: '',
      isAdd: true, //添加内容分
      relatedDiseaseWordList: [], // 关联词列表
      labelCol: {
        span: 3
      },
      wrapperCol: {
        span: 10
      },
      issziji: true, //子级
      diseaseType: 1,
      curr_i: 0,
      visible: false,
      mockData: [],
      targetKeys: [],
      form: this.$form.createForm(this, { name: 'form' }),
      loading: false,
      cur_Id: 0,
      isShowDoctor: false,
      dataLoading: false,
      isShowDiseaseModal: false,
      SiblIndex: 0, //区分同级和子级
      wordingsShow: false, //词条显示窗
      relatedDiseaseWordList: [],
      treeDataPart: [],
      treeDataLab: [],
      treeDataDic: [],
      isDic: false,
      replaceFields: { children: 'subList' },
      baseH: 0, //顶部基本信息
      isShowContent: false, //展示内容
      editItem: {},//存储信息
    }
  },
  props: {
    item: {
      type: Object,
      default: {}
    }
  },
  watch: {
    item: function(val) {
      this.getPart()
      this.getLab()
      this.loadDictrynary()
      if (val.id > 0) {
        this.$nextTick(() => {
          this.loadDet(this.item.id)

          this.isAdd = false
          this.loadDictrynary()
        })
      } else {
        this.$nextTick(() => {
          this.init()
          this.loadDictrynary()
        })
      }
    }
  },
  computed: {
    look() {
      return this.item.type == 1
    },
    tmpItem() {
      return Object.keys(this.tmpCurrentItem).length > 0
    }
  },
  mounted() {
    this.listenerFunction()
    this.getPart()
    this.getLab()
    this.loadDictrynary()
    if (this.item.id > 0) {
      this.$nextTick(() => {
        this.loadDet(this.item.id)
        this.isAdd = false
      })
    } else {
      this.$nextTick(() => {
        this.init()
      })
    }
  },
  beforeDestroy() {
    //移除滚动条事件
    this.beforeDestroy()
  },
  methods: {
    loadDet(id) {
      this.dataLoading = true
      apiProgram
        .getDetail(id)
        .then(res => {
          if (res.code == 200) {
            this.dataLoading = false
            this.contentList = res.data.contentList
            this.relatedDiseaseWordList = res.data.relatedDiseaseWordList
            this.isGenetic = res.data.isGenetic
            this.isLatency = res.data.isLatency
            this.isMedicare = res.data.isMedicare
            this.isShowDoctor = res.data.isShowDoctor
            this.yskDoctorList = res.data.yskDoctorList
            this.latenncyPeriod = res.data.latenncyPeriod
            this.latenncyPeriodUnit = res.data.latenncyPeriodUnit
            this.imgList = res.data.imgList || []
            res.data.alias = res.data.alias.split(',') || []
            this.form.setFieldsValue(res.data)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    // XXY
    xxy() {
      console.log(1258)
      window.event.cancelBubble = true
    },
    //
    findDepSibDic(node) {
      let that = this
      for (let v of node) {
        if (v.item) {
          v.title = v.item.name
          v.value = v.item.name
          v.subList = v.items
          delete v['item']
          delete v['items']
        }
        if (v.subList) {
          that.findDepSibDic(v.subList)
        } else {
          return
        }
      }
    },
    // 加载字典
    loadDictrynary() {
      this.dataLoading = true
      let ps = { namePath: '全部' }
      apiDicManage
        .getCategory(ps)
        .then(res => {
          if (res.code == 200) {
            this.findDepSibDic(res.data.items)
            this.treeDataDic = res.data.items.map(v => {
              v.idCard = 1
              return v
            })

            // this.dataLoading = false
          }
        })
        .catch(err => {
          console.log(err, 89)
          this.dataLoading = false
        })
    },
    // 点击选中医生
    handkeSelectDocItem() {
      this.selectDocShow = true
    },
    DWordList_close(i) {
      this.yskDoctorList.splice(i, 1)
    },
    findDep(node) {
      let that = this
      for (let v of node) {
        if (v.item) {
          v.title = v.item.namePath
          v.value = v.item.namePath
          v.children = v.items
          delete v['item']
          delete v['items']
        }
        if (v.children) {
          that.findDep(v.children)
        } else {
          return
        }
      }
    },
    // 获取部位
    getPart() {
      this.loading = true
      let ps = { namePath: '部位' }
      apiBase
        .getCategory(ps)
        .then(res => {
          if (res.code == 200) {
            this.loading = false
            this.findDep(res.data.items)
            this.treeDataPart = res.data.items
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.warning(err.message)
        })
    },
    // 获取科室
    getLab() {
      this.loading = true
      let ps = { namePath: '科室' }
      apiBase
        .getCategory(ps)
        .then(res => {
          if (res.code == 200) {
            this.loading = false
            this.findDep(res.data.items)
            this.treeDataLab = res.data.items
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.warning(err.message)
        })
    },

    listenerFunction(e) {
      document.addEventListener('scroll', this.handleScroll, true)
    },
    beforeDestroy() {
      document.removeEventListener('scroll', this.listenerFunction)
    },
    //监听滚动事件
    handleScroll(e) {
      // var st = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      // console.log(st)
      //1.一般情况下直接打印上处注释掉的代码就可以看到滚动条距离顶部的距离
      //2.但如果发现一直是0 可能是因为overflow设置导致获取出错

      //3.此时打印事件函数e 和 e.target.scrollTop 可以得到距离顶部的距离
      // console.log(e);

      if (e.target.scrollTop >= this.baseH + 170) {
        $('.addchildren').addClass('pf')
      } else {
        $('.addchildren').removeClass('pf')
      }
    },

    // 关闭
    handleCloseForm() {
      this.isShowEdit = false
      this.isAddItem = false
      this.wordingsShow = false
      this.selectDocShow = false
      this.isDic = false
      this.isShowContent = false
    },
    handleOpenSelectLabModal() {
      this.wordingsShow = true
    },
    /* 删除列表内容 */
    handlecloseDel(data) {
      this.tmpCurrentItem = data
      this.findDel(this.contentList)
      return false
    },
    // 删除列表内容
    findDel(node) {
      let that = this
      for (let [i, item] of new Map(node.map((item, i) => [i, item]))) {
        if (item.title == that.tmpCurrentItem.title) {
          node.splice(i, 1)
          return
        }
        if (item.subList) {
          that.findDel(item.subList)
        }
      }
    },
    // 查看内容
    handleEye(data) {
      this.currentItem = { ...data }
      this.editItem = { ...data }
      this.isShowContent = true
      return false
    },
    handleEditEye() {
      this.findEye(this.contentList)
      this.editItem = {}
      this.currentItem = {}
      this.isShowContent = false
    },
    // 查看内容
    findEye(node) {
      let that = this
      for (var i = 0; i < node.length; i++) {
        if (node[i].title == that.currentItem.title) {
          node[i] = { ...that.editItem }
          return
        }
        if (node[i].subList) {
          that.findEye(node[i].subList)
        }
      }
    },
    // 选中文章后的数据
    handleSave(data) {
      this.relatedDiseaseWordList = data
      this.handleCloseForm()
    },
    handleSaveDoc(data) {
      this.yskDoctorList = data
      this.selectDocShow = false
    },

    // 添加编辑操作
    handleSibling() {
      if (this.SiblIndex == 1) {
        this.findDepSib(this.contentList)
      } else if (this.SiblIndex == 3) {
        this.findDepChird(this.contentList)
      } else {
        this.contentList.push({ ...this.currentItem })
        this.isAdd = false
      }
      this.handleCloseForm()
      this.currentItem = {}
    },

    // 添加同级
    findDepSib(node) {
      let that = this
      for (let item of node) {
        if (item.title == that.tmpCurrentItem.title) {
          node.push({ ...that.currentItem })
          return
        }
        if (item.subList) {
          that.findDepSib(item.subList)
        }
      }
    },
    // 编辑
    findDepEdit(node) {
      let that = this
      for (let item of node) {
        if (item.title == that.tmpCurrentItem.title) {
          if (item.subList) {
            item.subList.push({ ...that.currentItem })
          } else {
            item.subList = []
            item.subList.push({ ...that.currentItem })
          }
          return
        }
        if (item.subList) {
          that.findDepEdit(item.subList)
        }
      }
    },
    // 添加子级
    findDepChird(node) {
      let that = this
      for (let item of node) {
        if (item.title == that.tmpCurrentItem.title) {
          if (item.subList) {
            item.subList.push({ ...that.currentItem })
          } else {
            item.subList = []
            item.subList.push({ ...that.currentItem })
          }
          return
        }
        if (item.subList) {
          that.findDepChird(item.subList)
        }
      }
    },

    // 第一级
    handleSelectFirst(item, index, type) {
      item.type = type
      this.issziji = true
      this.tmpCurrentItem = { ...item }
      this.firstIndex = index
      this.formTitle = item.title
      this.baseH = $('.base-info-form').height()

      $(event.target)
        .parent()
        .find('.red')
        .removeClass('red')
      $(event.target)
        .addClass('red')
        .parent()
        .siblings()
        .find('.red')
        .removeClass('red')
      return false //阻止冒泡
    },
    // 第二级
    handleSelectSec(item, index) {
      this.tmpCurrentItem = { ...item }
      this.secondIndex = index
      this.issziji = true
      this.formTitle = item.title
      this.baseH = $('.base-info-form').height()
      $(event.target)
        .parents()
        .find('.red')
        .removeClass('red')
      $(event.target)
        .addClass('red')
        .parent()
        .siblings()
        .removeClass('red')
      return false //阻止冒泡
    },
    //第三级
    handleSelectThird(item, index) {
      this.issziji = true
      this.tmpCurrentItem = { ...item }
      this.thirdIndex = index
      this.formTitle = item.title
      this.baseH = $('.base-info-form').height()
      $(event.target)
        .parents()
        .find('.red')
        .removeClass('red')
      $(event.target)
        .addClass('red')
        .parent()
        .siblings()
        .find('.contentList-content-chird-item')
        .removeClass('red')
      return false //阻止冒泡
    },
    //第四级
    handleSelectFour(item, index) {
      this.issziji = true
      this.tmpCurrentItem = { ...item }
      this.formTitle = item.title
      this.baseH = $('.base-info-form').height()
      $(event.target)
        .parents()
        .find('.red')
        .removeClass('red')
      $(event.target)
        .addClass('red')
        .parent()
        .siblings()
        .find('.contentList-content-chird-item')
        .removeClass('red')
      return false //阻止冒泡
    },
    //第五级
    handleSelectFive(item, index) {
      this.issziji = false
      this.tmpCurrentItem = { ...item }
      this.formTitle = item.title
      this.baseH = $('.base-info-form').height()
      $(event.target)
        .parents()
        .find('.red')
        .removeClass('red')
      $(event.target)
        .addClass('red')
        .parent()
        .siblings()
        .find('.contentList-content-chird-item')
        .removeClass('red')
      return false //阻止冒泡
    },
    // 添加同级
    handleAddItem() {
      if (Object.keys(this.tmpCurrentItem).length == 0) {
        this.$message.warning('请选择添加对象')
        return
      }
      if (this.tmpCurrentItem.type == 1) {
        this.isDic = true
      } else {
        this.isAddItem = true
      }
      this.SiblIndex = 1
    },
    // 添加子级
    handleAddSublist() {
      if (Object.keys(this.tmpCurrentItem).length == 0) {
        this.$message.warning('请选择添加对象')
        return
      }
      this.isAddItem = true
      this.SiblIndex = 3
    },
    handleAddList() {
      // this.isAddItem = true
      this.SiblIndex = 0
      this.isDic = true
    },
    init() {
      this.item.type = -1
      this.contentList = []
      this.imgList = []
      this.isMedicare = 0
      this.isGenetic = 0
      this.isLatency = 0
      this.latenncyPeriod = 0
      this.relatedDiseaseWordList = []
      this.latenncyPeriodUnit = ''
      this.isShowDoctor = false
      this.yskDoctorList = []
      this.form.setFieldsValue({
        name: '',
        alias: [],
        relatedBodyList: [],
        relatedDeptList: [],
        videoUrl: '',
        audioUrl: '',
        diseaseTagList: []
      })
    },
    //关闭
    handleCancel() {
      this.init()
      this.$emit('close')
    },
    // 删除文章
    r_DWordList_close(i) {
      this.relatedDiseaseWordList.splice(i, 1)
    },
    // 替换图片
    handleIndex(i) {
      this.curr_i = i
    },
    recustomRequest1(file) {
      const formData = new FormData()
      formData.append('file', file.file)
      apiProgram
        .UploadImg(formData)
        .then(res => {
          if (res.code === 200) {
            this.imgList.splice(this.curr_i, 1, res.data[0])
          }
        })
        .catch(err => {
          this.$message.error(`load user err: ${err.message}`)
        })
      return false
    },
    customRequest(file) {
      const formData = new FormData()
      formData.append('file', file.file)
      apiProgram
        .UploadImg(formData)
        .then(res => {
          if (res.code === 200) {
            this.imgList.push(res.data[0])
          }
        })
        .catch(err => {
          this.$message.error(`load user err: ${err.message}`)
        })
    },
    // 删除图片
    handleRemove(i) {
      this.imgList.splice(i, 1)
      return false
    },

    onhandleselect(value, node, extra) {
      if (node.dataRef.idCard == 1) {
        if (this.contentList.length > 0) {
          node.dataRef.subList.map(v => {
            this.contentList.push(v)
          })
        } else {
          this.contentList = node.dataRef.subList
        }
      } else {
        this.contentList.push(node.dataRef)
      }

      this.isDic = false
    },
    // 保存
    handleSubmit() {
      this.form.validateFields((error, values) => {
        values.imgList = this.imgList
        values.isMedicare = this.isMedicare
        values.relatedDiseaseWordList = this.relatedDiseaseWordList
        values.isLatency = this.isLatency
        values.latenncyPeriod = this.latenncyPeriod
        values.latenncyPeriodUnit = this.latenncyPeriodUnit
        values.isGenetic = this.isGenetic
        values.contentList = this.contentList
        values.diseaseType = this.diseaseType
        values.isShowDoctor = this.isShowDoctor
        values.yskDoctorList = this.yskDoctorList
        values.alias = values.alias.join(',')
        if (this.item.id > 0) {
          values.id = this.item.id
        }
        if (
          values.name &&
          values.relatedBodyList &&
          values.relatedDeptList &&
          values.imgList &&
          values.diseaseTagList &&
          values.yskDoctorList &&
          values.contentList.length > 0
        ) {
          apiProgram
            .sendDiseaseword(values)
            .then(res => {
              if (res.code == 200) {
                this.$emit('close')
                this.$message.success('编辑成功')
                this.init()
              } else {
                this.$message.warning(res.message)
              }
            })
            .catch(err => {
              this.$message.error(err.message)
            })
        } else {
          this.$message.warning('请填写所有必填项')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.addchildren {
  color: #005cc8;
  text-align: right;
  span {
    font-size: 16px;
    margin-left: 30px;
    cursor: pointer;
  }
}
.baidumap {
  width: 570px;
  height: 500px;
}
.base-info {
  display: flex;
  .base-info-logo {
    display: flex;
    flex-direction: column;
    margin-top: 70px;
    p {
      margin-left: 50%;
      transform: translateX(-50%);
    }
  }
}
// .base-info-form {
//   margin-left: 40px;
// }
.form {
  padding-bottom: 30px;
}
.formTit {
  font-size: 20px;
  margin-top: 20px;
  color: #13c2c2;
}
.ant-tag {
  margin-bottom: 5px;
}
.tagsBox {
  height: 200px;
  overflow: scroll;
}
.drawer-footer-action {
  text-align: right;
  float: none;
}
.disease-box {
  line-height: 2;
  height: 100px;
  overflow: auto;
}
.imageUrl {
  width: 100%;
  height: 102px;
}
.pf {
  position: fixed;
  right: 40px;
  top: 0px;
  z-index: 2000;
  background-color: #fff;
}
.hospitaltag {
  display: inline-block;
  position: relative;
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-left: 12px;
  margin-top: 10px;
  width: 100px;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  :hover {
    cursor: pointer;
  }
  .iconx {
    position: absolute;

    top: 10px;
    font-size: 12px;
    right: 0;
    z-index: 1000;
    :hover {
      background-color: #ccc;
    }
  }
}
/deep/ .ant-btn {
  border-color: none;
  margin-left: 0;
}
.contentList-content {
  width: 850px;
  margin: 30px auto;
  background: #ededed;
  .contentList-content-item {
    width: 100%;
    padding-left: 10px;
    border-bottom: 1px solid #fff;
    cursor: pointer;
    position: relative;
    div {
      // height: 30px;
      display: flex;
      flex-wrap: wrap;

      width: 100%;
      span {
        font-size: 16px;
        line-height: 30px;
        display: flex;
        .textarea {
          width: 270px;
          flex-shrink: 0;
        }
        &:last-child {
          margin-left: 50px;
        }
      }
    }
  }
}
.contentList-content-chird {
  padding-left: 30px;
  .contentList-content-chird-item {
    padding-left: 10px;
    border-bottom: 1px solid #fff;
    cursor: pointer;
    display: flex;
    flex-wrap: wrap;

    span {
      font-size: 16px;
      line-height: 30px;
      display: flex;
      .textarea {
        width: 270px;
        flex-shrink: 0;
      }
      &:last-child {
        margin-left: 50px;
      }
    }
  }
}
.handleclose {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 16px !important;
  z-index: 1000;
  &:hover {
    background: #dedede;
  }
}
.handleeye {
  position: absolute;
  right: 27px;
  top: 0px;
  font-size: 16px !important;
  z-index: 1000;
  &:hover {
    background: #dedede;
  }
}
.img {
  cursor: pointer;
  width: 27px;
  height: 27px;
  position: absolute;
  right: -28px;
  top: -13px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}
.clearfix /deep/ .ant-upload.ant-upload-select-picture-card {
  height: 30px;
}
.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
.imgList {
  display: flex;
  img {
    width: 120px;
  }
}
.pr {
  position: relative;
  margin-right: 30px;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 200;
  font-size: 20px !important;
  &:hover {
    background: #ddd;
  }
}
.r_DWordList_close {
  position: absolute;
  right: -8px;
  font-size: 14px !important;
  top: -5px;
}
.bg {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 11px;
    height: 11px;
    background: url('https://image.39.net/ajt/wap/images/star.png') no-repeat center/100%;
  }
}
.modal_b {
  margin-top: 30px;
  display: flex;
  justify-content: space-around;
}
.red {
  color: red;
}
.current {
  color: #1890ff;
}
</style>
