import {
  axios
} from '@/utils/request'
export default class {
  // 列表
  static getdata(params) {
    return axios({
      url: `columnword/`,
      params,
      method: 'get'
    });
  }
  // 详情
  static getdatadetail(id) {
    return axios({
      url: `columnword/${id}`,
      method: 'get'
    });
  }
  // 添加
  static sendData(data) {
    return axios({
      url: data.id ? `columnword/${data.id}` : `columnword/`,
      method: data.id ? `put` : `post`,
      data,
    });
  }
  static delData(data) {
    return axios({
      url: `columnword/${data.id}`,
      method: 'delete',
    });
  }
  // /DiseaseWord/{id}
  static getDisWordList(params) {
    return axios({
      url: `/DiseaseWord`,
      method: 'get',
      params
    });
  }
  // huoqu wenzhang 
  // /DoctorsView
  static DoctorsView(params) {
    return axios({
      url: `/DoctorsView`,
      method: 'get',
      params
    });
  }

  // 词条疾病list

  static getDiseaseword(params) {
    return axios({
      url: `/diseaseword`,
      method: 'get',
      params
    });
  }
  //获取详情
  static getDetail(id) {
    return axios({
      url: `/diseaseword/${id}`,
      method: 'get',
    });
  }
  //添加和编辑接口
  static sendDiseaseword(data) {
    let path = '/diseaseword/'
    let way = data.id ? 'put' : 'post'
    return axios({
      url: path,
      method: way,
      data
    });
  }

  // 词条审核
  static PutDepartmentaudit(params) {
    return axios({
      url: '/diseaseword/audit',
      method: "get",
      params
    });
  }
  // GetOffline下线
  static GetOffline(params) {
    let path = params.reason ? '/diseaseword/offline' : '/diseaseword/online'
    return axios({
      url: path,
      method: "get",
      params
    });
  }
  //  删除词条

  static GetDelete(params) {
    return axios({
      url: '/diseaseword/delete',
      method: "get",
      params
    });
  }
  // 根据医生id获取观点

  static GetDoctorsViewById(id) {
    return axios({
      url: `/DoctorsView/${id}`,
      method: "get"
    });
  }

  //  根据医生id删除观点
  static deleteDoctorsViewById(id) {
    return axios({
      url: `/DoctorsView/${id}`,
      method: "delete"
    });
  }

  //  上传图片
  static UploadImg(data) {
    return axios({
      url: `/UploadImg`,
      method: "post",
      data
    });
  }
  // 添加观点
  static editDoctorsView(data) {
    return axios({
      url: '/DoctorsView',
      method: 'post',
      data
    })
  }
  // getDoctorsViewCmsy医生观点
  static getDoctorsViewCms(params) {
    return axios({
      url: '/DoctorsView/cms',
      method: 'get',
      params
    })
  }

  // 根据id获取词条/diseaseword/{id}
  static getDoctorsViewCms(params) {
    return axios({
      url: '/DoctorsView/cms',
      method: 'get',
      params
    })
  }
  // 获取医生列表http://zk-mg-test.39.net/api/v1
  static getDocList(params) {
    return axios({
      url: '/diseaseword/doctorlist',
      method: 'get',
      params
    })
  }
}