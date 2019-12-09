<template>
  <div :id="id" :class="className" :style="getStyle" />
</template>

<script>
  import echarts from 'echarts'
  export default {
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '200px'
      },
      data:{
        type:Array,
        required: true,
        default(){
          return []
        }
      },
      area:String,
      projectType:[Number,String],
      colorIndex:{
        type:[Number,String],
        default:0
      },
      title:String
    },
    data() {
      return {
        chart: null,
        colorList:[
          ['#72B4FB','#82ADFA','#497FE0'],
          ['#45B9B0','#53A541','#8CD17D'],
          ['#FF903B','#FFC26B','#FFB750']
        ],
        totalNum:''
      }
    },
    watch:{
      data:{
        handler(val,oldVal){
          this.initNum();
          this.initChart();
        },
        deep:true
      }
    },
    computed: {
      getStyle() {
        if (this.width.endsWith('%')) {
          return {
            height: this.changeRem(this.height) + 'px',
            width: this.width
          }
        }else {
          return {
            height: this.changeRem(this.height) + 'px',
            width:  this.changeRem(this.width) + 'px'
          }
        }
      }
    },
    created(){
      this.initNum()
    },
    mounted() {
      this.initChart();
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose();
      this.chart = null
    },
    methods: {
      initNum(){
        let count=0;
        for(var i=0;i<this.data.length;i++) {
          count+=this.data[i].value

        }
        this.totalNum=count.toString();
      },
      initChart() {
        let _this=this;
        this.chart = echarts.init(document.getElementById(this.id));

				let option = {
          animation: true,
          tooltip:{
          	show:true,
          	showContent:true,
          	alwaysShowContent:true,
          	formatter: '{c}%'
          },
          xAxis: {
              type: 'category',
              boundaryGap : false,
              splitLine: {
                  show: true
              }
          },
          yAxis: {
              type: 'value',
              axisTick: {
                  inside: true
              },
              splitLine: {
                  show: true
              },
              axisLabel: {
                  inside: true,
                  formatter: '{value}%\n'
              },
              z: 10
          },
          series: [
              {
                  name:this.title,
                  type:'line',
                  smooth:true,
                  stack: 'a',
                  symbol: 'circle',
                  symbolSize: 5,
                  sampling: 'average',
                  itemStyle: {
                      normal: {
                          color: '#54D8FF'
                      }
                  },
                  areaStyle: {
                      normal: {
                          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                              offset: 0,
                              color: '#54D8FF'
                          }, {
                              offset: 1,
                              color: '#FFFFFF'
                          }])
                      }
                  },
                  data: this.data
              }

          ]
      };


        this.chart.setOption(option);
      },
      changeRem(number) {
        return (parseFloat(number) * Math.min(this.$scale, 1))
      }
    }
  }
</script>
