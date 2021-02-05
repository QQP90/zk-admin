import { axios } from '@/utils/request'

export default class {
    // 查询疾病列表
    static getList(params) {
        return axios({
            url: 'diseaseinfo',
            method: 'get',
            params
        });
    }
    
}