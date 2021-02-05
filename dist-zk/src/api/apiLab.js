import { axios} from '@/utils/request'

export default class {

  static getCategory(params) {
    return axios({
      url: '/category',
      method: 'get',
      params
    });
  }
  static sentCategory(params) {
    return axios({
      url: params.id?`/category/${params.id}`:'/category',
      method: params.id?`put`:'post',
      data:params
    });
  }
  static deleteCategory(data) {
    return axios({
      url: '/category'+data.id,
      method: 'post',
      data
    });
  }
}