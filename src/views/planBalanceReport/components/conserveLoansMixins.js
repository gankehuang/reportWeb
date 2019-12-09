const tableData={
  data(){
    return{
      conserveLoans:[{
        title: '服务部',
        key: 'fservicedeptname',
        width: 100,
      },{
        title: '养户',
        key: 'fcustinfoname',
        width: 60,
      },{
        title: '养户类型',
        key: 'fcusttype',
        width: 80,
      },{
        title: '饲养规模',
        align:'right',
        width: 80,
        key: 'ffeedingscale',
      },{
        title: '现存保证金',
        key: 'fbalance',
        align:'right',
        width: 95
      },{
        title: '在养批次投苗数',
        key: 'ftmts',
        align:'right',
        width: 120
      },{
        title: '现存栏',
        align:'right',
        key: 'fcurcnt',
      },{
        title: '单头贷款金额（万元）',
        align:'right',
        width:110,
        key: 'fheadloanamt',
      },{
        title: '预计贷款金额（万元）',
        align:'right',
        width:110,
        key: 'fextiloanamt',
      },{
        title: '贷款办理日期',
        width:110,
        key: 'floandate',
        timeFormat:true
      }]
    }
  }
}
export  default  tableData
