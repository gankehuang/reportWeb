import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
 **/
export const constantRouterMap = [{
  path: '/login',
  component: () =>
    import ('@/views/login/index'),
  hidden: true
},
  {
    path: '/404',
    component: () =>
      import ('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    auth: 'yes',  // 特殊权限
    meta: {title: '首页', icon: 'homeMenu'},
    children: [{
      path: 'dashboard',
      name: 'DashboardIndex',
      meta: {title: '首页', affix: true},
      component: () =>
        import ('@/views/dashboard/index')
    }]
  },
  {
    path: '/monthReport',
    component: Layout,
    redirect: '/monthReport/efficImproAnalysis',
    name: 'monthReport',
    auth: 'BR_WEB_YDJY',
    meta: {title: '月度经营汇报', icon: 'monthMenu'},
    children: [
      {
        path: 'monthOpration',
        name: 'monthOpration',
        auth: 'BR_WEB_YDJY_GG_JYJH',
        meta: {title: '月度经营计划表'},
        component: () =>
          import ('@/views/monthReport/publicReport/monthOpration')
      }, {
        path: '/kpiAnalysis',
        name: 'kpiAnalysis',
        auth: 'BR_WEB_YDJY_GG_ZBDC',
        meta: {title: '业绩指标达成预警'},
        component: () =>
          import ('@/views/monthReport/publicReport/kpiAnalysis')
      },
      {
        path: 'efficImproAnalysis',
        name: 'efficImproAnalysisIndex',
        auth: 'BR_WEB_YDJY_GF_XLTS',
        meta: {title: '效率提升指标'},
        component: () =>
          import ('@/views/monthReport/sharesReport/efficImproAnalysis')
      }, {
        path: 'importantTzProject',
        name: 'importantTzProjectIndex',
        auth: 'BR_WEB_YDJY_GF_ZYTZ',
        meta: {title: '重要投资项目'},
        component: () =>
          import ('@/views/monthReport/sharesReport/importantTzProject')
      },
      {
        path: 'importantGltsProjectIndex',
        name: 'importantGltsProjectIndex',
        auth: 'BR_WEB_YDJY_GF_GLTS',
        meta: {title: '重要管理提升项目'},
        component: () =>
          import ('@/views/monthReport/sharesReport/importantGltsProject')
      }, {
        path: 'taskbillIndex',
        name: 'taskbillIndex',
        auth: 'BR_WEB_YDJY_GF_RWD',
        meta: {title: '任务清单'},
        component: () =>
          import ('@/views/monthReport/sharesReport/taskbill')
      }, {
        path: 'monthOpration/matingDeepDetail',
        name: 'matingDeepDetail',
        meta: {title: '配种分娩率排名'},
        hidden: true,
        component: () =>
          import ('@/views/monthReport/publicReport/monthOpration/matingDeepDetail')
      }, {
        path: 'monthOpration/matingDeepFgs/:orgId/:period/:level/:orgName',
        name: 'matingDeepFgs',
        meta: {title: '配种分娩率分公司排名'},
        hidden: true,
        component: () =>
          import ('@/views/monthReport/publicReport/monthOpration/matingDeepFgs')
      }, {
        path: 'monthOpration/mortalityDeepDetail',
        name: 'mortalityDeepDetail',
        meta: {title: '月度死亡率排名'},
        hidden: true,
        component: () =>
          import ('@/views/monthReport/publicReport/monthOpration/mortalityDeepDetail')
      }
    ]
  },
  {
    path: '/weekPlan',
    component: Layout,
    redirect: '/weekPlan/weekPlanTrack',
    name: 'weekPlan',
    auth: 'BR_WEB_YDJY',
    meta: {title: '周计划追踪', icon: 'balanceMenu'},
    children: [{
        path: 'weekPlanTrack',
        name: 'weekPlanTrack',
        auth: 'BR_WEB_YDJY_GG_JYJH',
        meta: {title: '周计划追踪汇总'},
        component: () =>
          import ('@/views/weekPlan/weekPlanTrack')
    }, {
      path: 'weekPlanWarning',
      name: 'weekPlanWarning',
      auth: 'BR_WEB_YDJY_GG_JYJH',
      meta: {title: '周计划达成预警'},
      component: () =>
        import ('@/views/weekPlan/weekPlanWarning')
    },{
      path: 'weekPlanWarning/weekIndexWarning/:kname/:kid/:period/:level/:orgId/:week',
      name: 'weekIndexWarning',
      auth: 'BR_WEB_YDJY_GG_JYJH',
      hidden: true,
      meta: {title: '周计划指标预警'},
      component: () =>
        import ('@/views/weekPlan/weekPlanWarning/weekIndexWarning')
    },{
      path: 'weekPlanWarning/weekIndexWarningDeep/:kname/:kid/:period/:level/:orgId/:week',
      name: 'weekIndexWarningDeep',
      auth: 'BR_WEB_YDJY_GG_JYJH',
      hidden: true,
      meta: {title: '周计划指标预警-穿透'},
      component: () =>
        import ('@/views/weekPlan/weekPlanWarning/weekIndexWarningDeep')
    }]
  },
  {
    path: '/planBalanceReport',
    component: Layout,
    redirect: '/planBalanceReport/servicePlan',
    name: 'planBalanceReport',
    auth: 'BR_WEB_HZPH',
    meta: {title: '计划汇总与平衡', icon: 'balanceMenu'},
    children: [{
      path: 'pigPlan',
      name: 'pigPlan',
      auth: 'BR_WEB_HZPH_ZC',
      meta: {title: '猪场计划汇总'},
      component: () =>
        import ('@/views/planBalanceReport/pigPlan'),
      children: [{
        path: 'introduction',
        name: 'introduction',
        auth: 'BR_WEB_HZPH_ZC_YZC',
        meta: {title: '月度引种计划汇总表'},
        component: () =>
          import ('@/views/planBalanceReport/pigPlan/introduction')
      },
        {
          path: 'introduction2',
          name: 'introduction',
          hidden: true,
          meta: {title: '月度引种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/introduction')
        },
        {
          path: 'introduction3',
          name: 'introduction',
          hidden: true,
          meta: {title: '月度引种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/introduction')
        },
        {
          path: 'introduction4',
          name: 'introduction',
          hidden: true,
          meta: {title: '月度引种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/introduction')
        }, {
          path: 'mating',
          name: 'mating',
          // auth: 'BR_WEB_HZPH_ZC_PZC',
          meta: {title: '月度配种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/mating')
        }, {
          path: 'mating2',
          name: 'mating',
          hidden: true,
          meta: {title: '月度配种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/mating')
        }, {
          path: 'mating3',
          name: 'mating',
          hidden: true,
          meta: {title: '月度配种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/mating')
        }, {
          path: 'mating4',
          name: 'mating',
          hidden: true,
          meta: {title: '月度配种计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/mating')
        }, {
          path: 'seedlingEmergence',
          name: 'seedlingEmergence',
          auth: 'BR_WEB_HZPH_ZC_CMC',
          meta: {title: '月度出苗计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/seedlingEmergence')
        }, {
          path: 'seedlingEmergence2',
          name: 'seedlingEmergence',
          hidden: true,
          meta: {title: '月度出苗计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/seedlingEmergence')
        }, {
          path: 'seedlingEmergence3',
          name: 'seedlingEmergence',
          hidden: true,
          meta: {title: '月度出苗计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/seedlingEmergence')
        }, {
          path: 'seedlingEmergence4',
          name: 'seedlingEmergence',
          hidden: true,
          meta: {title: '月度出苗计划汇总表'},
          component: () =>
            import ('@/views/planBalanceReport/pigPlan/seedlingEmergence')
        }
      ]
    },
      {
        path: 'servicePlan',
        name: 'servicePlan',
        auth: 'BR_WEB_HZPH_FWB',
        meta: {title: '服务部计划汇总'},
        component: () =>
          import ('@/views/planBalanceReport/servicePlan'),
        children: [{
          path: 'seedlingThrowing',
          name: 'seedlingThrowing',
          auth: 'BR_WEB_HZPH_FWB_TMC',
          meta: {title: '月度投苗计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/seedlingThrowing')
        }, {
          path: 'seedlingThrowing2',
          name: 'seedlingThrowing',
          hidden: true,
          meta: {title: '月度投苗计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/seedlingThrowing')
        }, {
          path: 'seedlingThrowing3',
          name: 'seedlingThrowing',
          hidden: true,
          meta: {title: '月度投苗计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/seedlingThrowing')
        }, {
          path: 'seedlingThrowing4',
          name: 'seedlingThrowing',
          hidden: true,
          meta: {title: '月度投苗计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/seedlingThrowing')
        }, {
          path: 'fatPigSlaughter',
          name: 'fatPigSlaughter',
          auth: 'BR_WEB_HZPH_FWB_CLC',
          meta: {title: '月度肥猪出栏计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/fatPigSlaughter')
        }, {
          path: 'fatPigSlaughter2',
          name: 'fatPigSlaughter',
          hidden: true,
          meta: {title: '月度肥猪出栏计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/fatPigSlaughter')
        }, {
          path: 'fatPigSlaughter3',
          name: 'fatPigSlaughter',
          hidden: true,
          meta: {title: '月度肥猪出栏计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/fatPigSlaughter')
        }, {
          path: 'fatPigSlaughter4',
          name: 'fatPigSlaughter',
          hidden: true,
          meta: {title: '月度肥猪出栏计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/fatPigSlaughter')
        }, {
          path: 'conserveLoans',
          name: 'conserveLoans',
          meta: {title: '月度养户贷款计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/conserveLoans')
        }, {
          path: 'conserveLoans2',
          name: 'conserveLoans',
          hidden: true,
          meta: {title: '月度养户贷款计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/conserveLoans')
        }, {
          path: 'conserveLoans3',
          name: 'conserveLoans',
          hidden: true,
          meta: {title: '月度养户贷款计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/conserveLoans')
        }, {
          path: 'conserveLoans4',
          name: 'conserveLoans',
          hidden: true,
          meta: {title: '月度养户贷款计划汇总'},
          component: () =>
            import ('@/views/planBalanceReport/servicePlan/conserveLoans')
        }, {
          path: '/pagePenetrationOne',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度引种计划汇总表明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }, {
          path: '/pagePenetrationTwo',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度配种计划汇总表明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }, {
          path: '/pagePenetrationThree',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度出苗计划汇总表明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }, {
          path: '/pagePenetrationFour',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度投苗计划汇总明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }, {
          path: '/pagePenetrationFive',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度肥猪出栏计划汇总明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }, {
          path: '/pagePenetrationSix',
          name: '/pagePenetration',
          hidden: true,
          meta: {title: '月度养户贷款计划汇总明细'},
          component: () =>
            import ('@/views/planBalanceReport/components/pagePenetration')
        }]
      },
      {
        path: '/supplyalance',
        name: 'supplyalance',
        auth: 'BR_WEB_HZPH_GX',
        meta: {title: '供需平衡表'},
        component: () =>
          import ('@/views/planBalanceReport/supplyalance'),
        children: [{
          path: 'pigletBalance',
          name: 'pigletBalance',
          auth: 'BR_WEB_HZPH_GX_ZM',
          meta: {title: '月度猪苗平衡表'},
          component: () =>
            import ('@/views/planBalanceReport/supplyalance/pigletBalance')
        }, {
          path: 'breederBalance',
          name: 'breederBalance',
          auth: 'BR_WEB_HZPH_GX_ZZ',
          meta: {title: '月度种猪平衡表'},
          component: () =>
            import ('@/views/planBalanceReport/supplyalance/breederBalance')
        }]
      }
    ]
  },
  {
    path: '/fillInReport',
    component: Layout,
    redirect: '/fillInReport/servicePlan',
    name: 'fillInReport',
    auth: 'BR_WEB_JHFK',
    meta: {title: '计划填报及反馈', icon: 'planMenu'},
    children: [{
      path: '/pigFarmPlan',
      name: 'pigFarmPlan',
      auth: 'BR_WEB_JCSZ_PZ',
      meta: {title: '猪场计划填报'},
      component: () =>
        import ('@/views/fillInReport/pigFarmPlan'),
      children: [{
        path: 'introductionPlanDetails',
        name: 'introductionPlanDetailsDetail',
        auth: 'BR_WEB_JHFK_ZC_YZ',
        meta: {title: '引种计划'},
        component: () =>
          import ('@/views/fillInReport/pigFarmPlan/introductionPlanDetails/indexDetail')
      }, {
        path: 'breedingPlanDetails',
        name: 'breedingPlanDetailsDetail',
        auth: 'BR_WEB_JHFK_ZC_PZ',
        meta: {title: '配种计划'},
        component: () =>
          import ('@/views/fillInReport/pigFarmPlan/breedingPlanDetails/indexDetail')
      }, {
        path: 'seedlingPlanDetails',
        name: 'seedlingPlanDetailsDetail',
        auth: 'BR_WEB_JHFK_ZC_CM',
        meta: {title: '出苗计划'},
        component: () =>
          import ('@/views/fillInReport/pigFarmPlan/seedlingPlanDetails/indexDetail')
      },
        {
          path: '/swine/index',
          name: 'swineIndex',
          meta: {title: '种猪场种猪存栏'},
          auth: 'BR_WEB_JHFK_ZC_ZZ',
          component: () =>
            import ('@/views/fillInReport/pigFarmPlan/swine')
        },
        {
          path: '/productionQuota/index',
          name: 'productionQuotaIndex',
          meta: {title: '猪场生产指标计划'},
          auth: 'BR_WEB_JHFK_ZC_SC',
          component: () =>
            import ('@/views/fillInReport/pigFarmPlan/productionQuota')
        }
      ]
    }, {
      path: '/servicePlan',
      name: 'servicePlan',
      auth: 'BR_WEB_JHFK_FWB',
      meta: {title: '服务部计划填报'},
      component: () =>
        import ('@/views/fillInReport/servicePlan'),
      children: [{
        path: 'fosterPlan',
        name: 'fosterPlan',
        auth: 'BR_WEB_JHFK_FWB_YH',
        meta: {title: '养户开发计划'},
        component: () =>
          import ('@/views/fillInReport/servicePlan/fosterPlan')
      },
        {
          path: 'seedlingPlan',
          name: 'seedlingPlan',
          auth: 'BR_WEB_JHFK_FWB_TM',
          meta: {title: '养户投苗计划'},
          component: () =>
            import ('@/views/fillInReport/servicePlan/seedlingPlan')
        },
        {
          path: 'conserveLoans',
          name: 'conserveLoans',
          auth: 'BR_WEB_JHFK_FWB_YHD',
          meta: {title: '养户贷计划'},
          component: () =>
            import ('@/views/fillInReport/servicePlan/conserveLoans')
        },
        {
          path: 'promotionPig',
          name: 'promotionPig',
          auth: 'BR_WEB_JHFK_FWB_CL',
          meta: {title: '肥猪上市计划'},
          component: () =>
            import ('@/views/fillInReport/servicePlan/promotionPig')
        },
        {
          path: 'batchSettlement',
          name: 'batchSettlement',
          auth: 'BR_WEB_JHFK_FWB_JS',
          meta: {title: '批次结算计划'},
          component: () =>
            import ('@/views/fillInReport/servicePlan/batchSettlement')
        },
        {
          path: 'monthSummaryPlan',
          name: 'monthSummaryPlan',
          auth: 'BR_WEB_JHFK_FWB_SC',
          meta: {title: '服务部生产指标计划'},
          component: () =>
            import ('@/views/fillInReport/servicePlan/monthSummaryPlan')
        }
      ]
    }, {
      path: '/developmentPlan',
      name: 'developmentPlan',
      auth: 'BR_WEB_JHFK_FZ',
      meta: {title: '发展类计划填报及反馈'},
      component: () =>
        import ('@/views/fillInReport/developmentPlan'),
      children: [{
        path: 'developmentPlan',
        name: 'developmentPlan',
        auth: 'BR_WEB_JHFK_FZ_ZC',
        meta: {title: '已租赁猪场管理计划及追踪'},
        component: () =>
          import ('@/views/fillInReport/developmentPlan/rentalBreedingGrounds')
      },
        {
          path: 'leasePlan',
          name: 'leasePlan',
          auth: 'BR_WEB_JHFK_FZ_LS',
          meta: {title: '代建及租赁栏舍计划及追踪'},
          component: () =>
            import ('@/views/fillInReport/developmentPlan/leasePlan')
        },
        {
          path: 'projectFunds',
          name: 'projectFunds',
          auth: 'BR_WEB_JHFK_FZ_ZJ',
          meta: {title: '项目资金计划及追踪'},
          component: () =>
            import ('@/views/fillInReport/developmentPlan/projectFunds')
        }
      ]
    }, {
      path: '/humanResourcesPlan',
      name: 'humanResourcesPlan',
      auth: 'BR_WEB_JHFK_HR',
      meta: {title: '人资类计划填报及反馈'},
      component: () =>
        import ('@/views/fillInReport/humanResourcesPlan'),
      children: [{
        path: 'recruitmentPlan',
        name: 'recruitmentPlan',
        auth: 'BR_WEB_JHFK_HR_ZP',
        meta: {title: '人员招聘计划及追踪'},
        component: () =>
          import ('@/views/fillInReport/humanResourcesPlan/recruitmentPlan')
      },
        {
          path: 'personnelManagement',
          name: 'personnelManagement',
          auth: 'BR_WEB_JHFK_HR_RS',
          meta: {title: '人事管理反馈'},
          component: () =>
            import ('@/views/fillInReport/humanResourcesPlan/personnelManagement')
        }
      ]
    }]
  },
  {
    path: '/basicsSetting',
    component: Layout,
    redirect: '/basicsSetting/warningConfig',
    auth: 'BR_WEB_JCSZ',
    name: 'basicsSetting',
    meta: {title: '基础设置', icon: 'settingMenu'},
    children: [{
      path: 'warningConfig',
      name: 'warningConfig',
      auth: 'BR_WEB_JCSZ_PZ',
      meta: {title: '预警配置'},
      hidden:true,
      component: () =>
        import ('@/views/basicsSetting/warningConfig')
    }, {
      path: '/sysConfig/warningTemplate',
      name: 'warningTemplate',
      auth: 'BR_WEB_JCSZ_MB',
      meta: {title: '预警配置'},
      component: () =>
        import ('@/views/basicsSetting/warningTemplate')
    }]
  },
  {
    path: '/counterTrialSet',
    component: Layout,
    redirect: '/counterTrialSet',
    name: 'counterTrialSet',
    auth: 'BR_WEB_XTJK',
    meta: {title: '系统监控', icon: 'fillInMenu'},
    children: [{
      path: 'index',
      name: 'counterTrialSetIndex',
      meta: {title: '系统监控'},
      component: () =>
        import ('@/views/counterTrialSet')
    }]
  },
  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})
