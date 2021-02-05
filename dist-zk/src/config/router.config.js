// eslint-disable-next-line
import {
  RouteView
} from '@/layouts'
import {
  bxAnaalyse
} from '@/core/icons'

/**
 * 用户类型(0，1:内部用户)
 */
export const asyncRouterMap = [
  {
    path: '/BaseDesign',
    name: 'BaseDesign',
    redirect: '/BaseDesign/PartManage',
    component: RouteView,
    meta: {
      title: '基础设置',
      keepAlive: true,
      icon: bxAnaalyse,
      permission: [0, 1]
    },
    children: [{
        path: '/BaseDesign/PartManage',
        name: 'PartManage',
        component: () => import('@/views/BaseDesign/PartManage'),
        meta: {
          title: '部位管理',
          permission: [0, 1]
        }
      },
      {
        path: '/BaseDesign/LabManage',
        name: 'LabManage',
        component: () => import('@/views/BaseDesign/LabManage'),
        meta: {
          title: '科室管理',
          permission: [0, 1]
        }
      },
      {
        path: '/BaseDesign/DicManage',
        name: 'DicManage',
        component: () => import('@/views/BaseDesign/DicManage'),
        meta: {
          title: '字典管理',
          permission: [0, 1]
        }
      }
    ]
  }
  ,
  {
    path: '/Wnding',
    name: 'Wanding',
    redirect: '/Wanding/ProgramManage',
    component: RouteView,
    meta: {
      title: '词条管理',
      keepAlive: true,
      icon: bxAnaalyse,
      permission: [0, 1]
    },
    children: [{
        path: '/Wanding/ProgramManage',
        name: 'ProgramManage',
        component: () => import('@/views/Wanding/ProgramManage'),
        meta: {
          title: '栏目管理',
          keepAlive: false,
          permission: [0, 1]
        }
      },
      {
        path: '/Wanding/WandingIllnessManage',
        name: 'WandingIllnessManage',
        component: () => import('@/views/Wanding/WandingIllnessManageList'),
        meta: {
          title: '疾病词条管理',
          keepAlive: false,
          permission: [0, 1]
        }
      }
    ]
  }

 

]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [{
    path: '/403',
    hidden: true,
    component: () => import( /* webpackChunkName: "forbidden" */ '@/views/exception/403')
  },
  {
    path: '/404',
    component: () => import( /* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/500',
    component: () => import( /* webpackChunkName: "fail" */ '@/views/exception/500')
  }

]