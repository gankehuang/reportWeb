const tableData={
  data(){
    return{
      seedingPlan:[{
        title: '服务部',
        key: 'fservicedeptname',
        width: 70
      },{
        title: '养户姓名',
        key: 'cfmaintenname',
        width: 100
      },{
        title: '养户类型',
        key: 'fcusttype',
        width: 80
      },{
        title: '计划投苗日期',
        key: 'cfseedDate',
        width: 100,
        timeFormat:true
      },{
        title: '计划投苗日龄',
        key: 'cfplanseedday',
        width: 90
      },{
        title: '投苗头数',
        key: 'cfseedcnt',
        width: 90
      },{
        title: '投苗品种',
        key: 'fbreedtypename',
        width: 90
      },{
        title: '管理员',
        key: 'fmanagername',
        width: 70
      },{
        title: '来源猪场',
        key: 'fpigfarmname',
        width: 100,
      },{
        title: '来源分场',
        key: 'ffieldname',
        width: 100,
      },{
        title: '来源供应商',
        key: 'fsuppliername',
        width: 120,
      },{
        title: '备注',
        key: 'cfnote',
       width: 80,
      }]
    }
  }
}
export  default  tableData
