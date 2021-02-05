import { axios} from '@/utils/request'

export default class {

  static getCategory(params) {
    return axios({
      url: '/commondictionary',
      method: 'get',
      params
    });
  }
  static deleteCategory(params) {
    return axios({
      url:`/commondictionary/${params.id}`,
      method: 'delete',
      data:params
    });
  }
  static sentCategory(params) {
    return axios({
      url: params.id?`/commondictionary/${params.id}`:'/commondictionary',
      method: params.id?`put`:'post',
      data:params
    });
  }
  static deeleteCategory(params) {
    return axios({
      url: '/commondictionary',
      method: 'get',
      params
    });
  }
}
