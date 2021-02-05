<template>
  <div class="container custom-page-view" ref="view">
    <div class="content">
      <div class="tree">
        <a-input-search
          v-model="searchStr"
          placeholder="输入搜选项"
          style="width:200px;"
          @change="onChange"
        ></a-input-search>
        <!-- selectedKeys是选中项key的集合，expandedKeys是展开项key的集合 -->
        <a-tree
          v-model="checkedKeys"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          @expand="onExpand"
          :autoExpandParent="autoExpandParent"
          :replaceFields="replaceFields"
          @select="onSelect"
          :loading="dataLoading"
        >
          <template slot="title" slot-scope="{ name }">
            <span
              v-html="name.replace(new RegExp(searchValue, 'g'), '<span style=color:#f50>' + searchValue + '</span>')"
            ></span>
          </template>
        </a-tree>
      </div>
      <div class="content-r">
        <div class="custom-page-view-search" ref="search">
          <a-breadcrumb separator="/">
            <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="{ path: item.path }">{{
              item.meta.title
            }}</a-breadcrumb-item>
          </a-breadcrumb>
          <div class="current_location">
            当前位置：<span>{{ currentItem.name || '科室' }}</span>
            <a-button type="primary" @click="EditInfo" class="bbar-a">新增</a-button>

            <a-button
              style="margin-left:30px"
              @click="
                () => {
                  isDelItem = true
                }
              "
              :disabled="!exhibition"
              class="bbar-a"
              >删除</a-button
            >
          </div>
        </div>
        <div class="custom-page-view-table" v-if="exhibition">
          <a-form :form="form">
            <a-form-item label="ID" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <a-input disabled v-model="currentItem.id" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" class="bg" label="科室名称">
              <a-input v-model="currentItem.name" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="科室介绍">
              <a-textarea v-model="currentItem.description" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="排序号">
              <a-input v-model="currentItem.order" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="最后编辑时间，编辑人">
              <span>{{ currentItem.modifyUser || '' }}--</span>
              <span>{{ currentItem.modifyTime || '' }}</span>
            </a-form-item>
          </a-form>
          <div class="footer">
            <a-button @click="handleCloseForm">取消</a-button>
            <a-button type="primary" @click="clickSubmit(1)">提交</a-button>
          </div>
        </div>
        <div class="custom-page-view-table" v-if="addexhibition">
          <a-form :form="form">
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" class="bg" label="科室名称">
              <a-input v-model="addcurrentItem.name" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="科室介绍">
              <a-textarea v-model="addcurrentItem.description" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="排序号">
              <a-input v-model="addcurrentItem.order" />
            </a-form-item>
            <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="pinYin">
              <a-input v-model="addcurrentItem.pinYin" />
            </a-form-item>
          </a-form>
          <div class="footer">
            <a-button @click="handleCloseForm">取消</a-button>
            <a-button type="primary" @click="clickSubmit(3)">提交</a-button>
          </div>
        </div>
      </div>
    </div>

    <a-modal
      :body="null"
      :visible="isDelItem"
      centered
      :maskClosable="true"
      @ok="deleteIteme(currentItem)"
      @cancel="handleCloseForm"
    >
      <div style="font-size:18px;text-align:center">{{ delTitle }}</div>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'
import qs from 'qs'
import { Button } from 'ant-design-vue'
import apiBase from '@/api/apiBase'
import { formatSecondsShow } from '@/utils/util'

export default {
  name: 'HospitalList',
  data() {
    return {
      // tree
      replaceFields: { title: 'name', children: 'items', key: 'id' },
      expandedKeys: [],
      backupsExpandedKeys: [],
      autoExpandParent: false,
      checkedKeys: [],
      selectedKeys: [],
      searchValue: '',
      treeData: [],
      searchStr: '',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      queryParams: {},
      isDelItem: false, //是否删除
      exhibition: false,
      addexhibition: false,
      namePath: '科室',
      // 主数据是否加载中
      dataLoading: false,
      delTitle: '确认删除？',
      // 查询条件
      currentItem: {},
      addcurrentItem: {
        name: '',
        description: '',
        pinYin: '',
        order: null
      },
      reason: '',
      breadcrumbList: []
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
    onChange() {
      var vm = this
      //添加这行代码是为了只点击搜索才触发
      vm.searchValue = vm.searchStr
      //如果搜索值为空，则不展开任何项，expandedKeys置为空
      //如果搜索值不位空，则expandedKeys的值要为搜索值的父亲及其所有祖先
      if (vm.searchValue === '') {
        vm.expandedKeys = []
      } else {
        //首先将展开项与展开项副本置为空
        vm.expandedKeys = []
        vm.backupsExpandedKeys = []
        //获取所有存在searchValue的节点
        let candidateKeysList = vm.getkeyList(vm.searchValue, vm.treeData, [])
        //遍历满足条件的所有节点
        //
        candidateKeysList.map(item => {
          //获取每个节点的母亲节点
          var key = vm.getParentKey(item, vm.treeData)
          //当item是最高一级，父key为undefined，将不放入到数组中
          //如果母亲已存在于数组中，也不放入到数组中
          if (key && !vm.backupsExpandedKeys.some(item => item === key)) vm.backupsExpandedKeys.push(key)
        })
        let length = this.backupsExpandedKeys.length
        for (let i = 0; i < length; i++) {
          vm.getAllParentKey(vm.backupsExpandedKeys[i], vm.treeData)
        }
        vm.expandedKeys = vm.backupsExpandedKeys.slice()
      }
    },
    //获取节点中含有value的所有key集合
    getkeyList(value, tree, keyList) {
      //遍历所有同一级的树
      for (let i = 0; i < tree.length; i++) {
        let node = tree[i]
        //如果该节点存在value值则push
        if (node.name.indexOf(value) > -1) {
          keyList.push(node.id)
        }
        //如果拥有孩子继续遍历
        if (node.items) {
          this.getkeyList(value, node.items, keyList)
        }
      }
      //因为是引用类型，所有每次递归操作的都是同一个数组
      return keyList
    },
    //该递归主要用于获取key的父亲节点的key值
    getParentKey(key, tree) {
      let parentKey, temp
      let arr = tree
      let index = 0
      let thobj = {}
      //遍历同级节点
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.id == key) {
          index = arr.findIndex(item => item.id == node.id) //根据 已知id（this.a_id） 获取在数组中的位置(index)；
          thobj = arr.splice(index, 1) //从数据组移出当前数据；
          arr.splice(0, 0, ...thobj) // 把当前数据插入到数组第一位；
          tree = arr
        } else if (node.items) {
          //如果该节点的孩子中存在该key值，则该节点就是我们要找的父亲节点
          //如果不存在，继续遍历其子节点
          if (node.items.some(item => item.id === key)) {
            parentKey = node.id
          } else if ((temp = this.getParentKey(key, node.items))) {
            //parentKey = this.getParentKey(key,node.children)
            //改进，避免二次遍历
            parentKey = temp
          }
        }
      }
      return parentKey
    },
    //获取该节点的所有祖先节点
    getAllParentKey(key, tree) {
      var parentKey
      if (key) {
        //获得父亲节点
        parentKey = this.getParentKey(key, tree)
        if (parentKey) {
          //如果父亲节点存在，判断是否已经存在于展开列表里，不存在就进行push
          if (!this.backupsExpandedKeys.some(item => item === parentKey)) {
            this.backupsExpandedKeys.push(parentKey)
          }
          //继续向上查找祖先节点
          this.getAllParentKey(parentKey, tree)
        }
      }
    },
    onExpand(expandedKeys) {
      //用户点击展开时，取消自动展开效果
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onCheck(checkedKeys) {
      this.checkedKeys = checkedKeys
    },
    // 递归
    findDepSelect(node) {
      let that = this
      for (let data of node) {
        if (data.id == this.currentItem.id) {
          let name = this.getCaption(data.name, 0)
          this.currentItem = { ...data }
          this.currentItem.name = name
          if (this.currentItem.items.length > 0) {
            this.delTitle = '该项有子级，删除则该项全部下级一并删除，确定删除？'
          } else {
            this.delTitle = '确认删除？'
          }
          return
        } else if (data.items) {
          that.findDepSelect(data.items)
        } else {
          return
        }
      }
    },
    // 截取符号前面部分
    getCaption(obj, state) {
      var index = obj.lastIndexOf('\-')
      if (state == 0) {
        obj = obj.substring(0, index)
      } else {
        obj = obj.substring(index + 1, obj.length)
      }
      return obj
    },
    onSelect(selectedKeys, info) {
      this.exhibition = true
      this.addexhibition = false
      this.checkedKeys = selectedKeys
      this.currentItem = { id: selectedKeys[0] }
      this.findDepSelect(this.treeData)
    },
    // 递归
    findDepSib(node) {
      let that = this
      for (var i = 0; i < node.length; i++) {
        node[i].item.modifyTime = this.SetTime(node[i].item.modifyTime)
        node[i].item.name = `${node[i].item.name}-(${node[i].item.order})`
        node[i] = { ...node[i].item, items: node[i].items, scopedSlots: { title: 'title' } }
        if (node[i].items.length > 0) {
          that.findDepSib(node[i].items)
        }
      }
    },
    loadData() {
      this.dataLoading = true
      let ps = { namePath: this.namePath }
      apiBase
        .getCategory(ps)
        .then(res => {
          if (res.code == 200) {
            this.dataLoading = false
            this.currentItem = res.data.item
            this.findDepSib(res.data.items)
            this.treeData = res.data.items
          }
        })
        .catch(err => {
          console.log(err, 89)
          this.dataLoading = false
        })
    },
    handleCloseForm() {
      this.exhibition = false
      this.addexhibition = false
      this.isDelItem = false
      // this.loadData()
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

    // 删除
    deleteIteme(item) {
      if (Object.keys(item).length == 0) {
        this.$message.warning('请点击你要删除的左侧内容')
        return
      }
      this.dataLoading = true
      item.status = 2
      apiBase
        .deeleteCategory(item)
        .then(res => {
          if (res.code == 200) {
            this.dataLoading = false
            this.$message.success('删除成功')
            this.exhibition = false
            this.addexhibition = false
            this.loadData()
            this.isDelItem = false
          }
        })
        .catch(err => {
          this.$message.warning(err.message)
        })
    },
    EditInfo() {
      this.exhibition = false
      this.addexhibition = true
    },
    clickSubmit(i) {
      if (i == 1) {
        delete this.currentItem.modifyUser
        delete this.currentItem.modifyTime
        delete this.currentItem.items
        delete this.currentItem.scopedSlots
        this.dataLoading = true
        apiBase
          .sentCategory(this.currentItem)
          .then(res => {
            if (res.code == 200) {
              this.dataLoading = false
              this.$message.success('编辑成功')
              this.exhibition = false
              this.addexhibition = false
              this.loadData()
              this.addcurrentItem = {}
            }
          })
          .catch(err => {
            console.log(err.message)
          })
      } else {
        let { id, namePath } = this.currentItem
        namePath = namePath + '_' + this.addcurrentItem.name

        this.addcurrentItem = { ...this.addcurrentItem, parentId: id, namePath, status: 0 }
        if (this.addcurrentItem.order == null) {
          this.addcurrentItem.order = 0
        }
        apiBase
          .sentCategory(this.addcurrentItem)
          .then(res => {
            if (res.code == 200) {
              this.dataLoading = false
              this.loadData()
              this.$message.success('添加成功')
              this.exhibition = false
              this.addexhibition = false
              this.addcurrentItem = {}
            }
          })
          .catch(err => {
            this.$message.warning(err.message)
          })
      }
    }
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
.custom-page-view-table {
  height: 560px;
  overflow-y: auto;
  width: 500px;
}
.custom-page-view .content .content-r {
  margin-left: 80px;
}
.labname {
  width: 100px;
  word-break: break-word;
}

.footer {
  display: flex;
  justify-content: space-around;
}
.bg {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 80px;
    top: 10px;
    width: 11px;
    height: 11px;
    background: url('https://image.39.net/ajt/wap/images/star.png') no-repeat center/100%;
  }
}
</style>
