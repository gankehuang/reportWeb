const tableData={
  data(){
    return{
      promotionPig:[{
        title: '服务部',
        key: 'fservicedeptname',
        width: 80
      },{
        title: '养户批次',
        key: 'fbatchname',
        width: 100
      },{
        title: '管理员',
        key: 'fmanagername',
        width: 70
      },{
        title: '现存栏数量',
        key: 'fcurqty',
        align:'right',
        width: 100
      },{
        title: '现存栏日龄',
        key: 'fcurday',
        align:'right',
        width: 100
      },{
        title: '计划上市日龄',
        key: 'cfplanday',
        align:'right',
        width: 110
      },{
        title: '计划出栏均重',
        key: 'fplanavgweight',
        align:'right',
        width: 110
      },{
        title: '计划上市日期',
        key: 'fplandate',
        width: 110,
        timeFormat:true
      },{
        title: '计划上市数',
        key: 'fplanqty',
        align:'right',
        width: 100
      },{
        title: '已出栏头数',
        key: 'favtoutqty',
        align:'right',
        width: 100
      },{
        title: '已出栏日龄',
        key: 'favtoutday',
        align:'right',
        width: 100
      },{
        title: '已出栏均重',
        key: 'favtavgweight',
        align:'right',
        width: 100
      },{
        title: '预计批次存活率(%)',
        align:'right',
        key: 'fchl',
        width: 100
      },{
        title: '预计单头毛利',
        align:'right',
        key: 'foneprofit',
        width: 100
      },{
        title: '预估单斤成本',
        align:'right',
        key: 'fonecost',
        width: 100
      },{
        title: '其中：猪苗采购成本',
        align:'right',
        key: 'fpigpurcost',
        width: 100
      },{
        title: '出栏类型',
        key: 'fouttype',
        width: 80
      }]
    }
  }
}
export  default  tableData
