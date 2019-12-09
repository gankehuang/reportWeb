<template>
  <div class="page-form-item" :class="{'cell-input': cellInput}" :style="{display, width, height: heightCup}" >
    <label v-if="!hiddenLabel" class="page-form-item-label" :style="[{width: labelWidthCup}]">
        <div class="left-border" v-if="isPrinting"></div>
        <span class="require" v-if="required">*</span>
        <span class="page-form-item-label__text">
        {{label}}
      </span>
      </label>
    <div class="page-form-item-content" :class="{'align-top': alignTop, noPadding,'noLabel':hiddenLabel}"
      :style="formContentStyle">
      <el-form-item
        v-if="type"
        :prop="prop"
        ref="elpage-form-item"
        style="display: inline-block; width: 100%;">
       <!-- <el-tooltip effect="light"
          :content="validateMsgsProp.validateMessage"
          placement="top-end"
          popper-class="page-form-item-tooltip"
          :value="!validateMsgsProp.msgStatus"
          :disabled="$attrs.disabled"
          :enterable="false"
          :manual="true">
          <div>-->
          <div
            v-if="['text','password','textarea'].includes(type)"
            onmouseover="this.title = this.getElementsByClassName('el-input__inner')[0] ?
            this.getElementsByClassName('el-input__inner')[0].value : this.getElementsByClassName('el-textarea__inner')[0].value">
            <el-input
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              :type="type"
              :autosize="autoSize || { minRows: 3, maxRows: 3}"
              resize="none"
              :placeholder="$attrs.disabled?'':placeholder || `请输入${label}`"
            ></el-input>
          </div>
            <el-input
              v-else-if="type === 'number'"
              v-bind="$attrs"
              :value="value"
              type="text"
              @input="limitNumber($event,$attrs.dot)"
              :placeholder="$attrs.disabled?'':placeholder || `请输入${label}`"
            ></el-input>
            <el-input
              v-else-if="type === 'temperature'"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              type="number"
              :placeholder="$attrs.disabled?'':placeholder || `请输入${label}`"
            ></el-input>
            <el-radio-group
              v-else-if="type === 'radio'"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              @change="handleChange">
              <el-radio
                v-for="(item,index) in options || optionsData"
                :label="item.value"
                v-bind="item"
                :key="index">
                {{item.label}}
              </el-radio>
            </el-radio-group>
            <form-select
              v-else-if="['select','cascader'].includes(type)"
              v-bind="$attrs"
              v-on="bindListeners"
              :type="type"
              :value="value"
              :options="options"
              @change="handleChange"
              :placeholder="$attrs.disabled?'':placeholder || `请选择${label}`">
            </form-select>
            <form-select-data
              v-else-if="type === 'selectData'"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              :options="options"
              @change="handleChange"
              :placeholder="$attrs.disabled?'':placeholder || `请选择${label}`">
            </form-select-data>
            <el-date-picker
              v-else-if="['date','datetime','year','month'].includes(type)"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              :type="type"
              :editable="false"
              :value-format="timeFormat || 'timestamp'"
              @change="handleChange"
              onmouseover="this.title = this.getElementsByClassName('el-input__inner')[0].value"
              :placeholder="$attrs.disabled?'':placeholder || `请选择${label}`">
            </el-date-picker>
            <form-upload
              v-else-if="type === 'file'"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value"
              @change="handleChange">
            </form-upload>
            <form-slider
              v-else-if="type === 'slider'"
              v-bind="$attrs"
              v-on="bindListeners"
              :value="value">
            </form-slider>
        <!--  </div>
        </el-tooltip>-->
      </el-form-item>
      <div class="text-box" v-else-if="value !== ''" :style="$attrs.fontStyle" @click="handleChange(value)">
        <div v-if="dateFormat">
          {{ parseTime(value) }}
        </div>
        <div v-else>
          {{valueFormat?stateFormat(value):value}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getDict} from "@/api/projectManager/dict";
import { Subject } from 'rxjs'
import { parseTime } from '@/utils/index'
export default {
  components: {
    'form-select': () => import('./form-select'),
    'form-select-data': () => import('./form-select-data'),
    'form-upload': () => import('./form-upload'),
    'form-slider': () => import('./form-slider')
  },
  props: {
    type: String, // 表单项类型
    autoSize: [Object,Boolean],
    label: String, // label文本
    inline:{
      type: Boolean,
      default: true
    }, // 是否级联显示
    span: [Number, String], // 所占24列中的多少分
    prop: String, // 绑定表单中的属性，用于表单验证
    height: [String, Number], // 表单项的高度
    alignTop: Boolean, // 内容区是否从顶部开始布局，默认垂直居中
    noPadding: Boolean, // 是否有内边距
    isPrinting: Boolean, // 打印中
    options: Array,
    valueFormat: {
      type: Boolean,
      default: false
    }, // 状态值的转换
    dateFormat: {
      type: Boolean,
      default: false
    }, // 时间值的转换
    timeFormat: String, // 时间格式化
    cellLabelWidth: [Number, String], // 单元格label宽度
    hiddenLabel: Boolean, // 是否隐藏label
    placeholder: String,
    value: {
      type: [Number, String, Array,Date]
    },
    cellInput: Boolean  // 在表格中嵌套使用
  },
  inject: {
    labelWidth: { default: 160 },
    rules: { default: {} },
    formSubject: { default: new Subject() }
  },
  computed: {
    bindListeners() {
      const events = this.$attrs.listeners
      if (events && Object.keys(events).includes('input')) {
        this.$delete(events,'input')
      }
      return Object.assign(this.$listeners,events)
    },
    formContentStyle() {
      const { labelWidthCup } = this;
      let str = ''
      if (this.hiddenLabel) {
        str = `width: calc(100% ${labelWidthCup} - ${this.changeRem(42)})`;
      }else {
        str = `width: calc(100% - ${labelWidthCup} - ${this.changeRem(10)})`; // Todo  - 18px - 24px
      }
      if (this.noPadding) {
        str = `width: calc(100% - ${labelWidthCup} - ${this.changeRem(10)}); height: 100%;`;
      }
      return str;
    },
    required() {
      const ruleData = this.rules[this.prop];
      let rq = false;
      if (!ruleData) {
        return rq;
      }
      ruleData.forEach((item) => {
        if (item.required) {
          rq = true;
        }
      });
      return rq;
    },
    labelWidthCup() {
      if (this.hiddenLabel) {
        return '-' + this.changeRem(18);
      }
      const val = this.cellLabelWidth || this.labelWidth;
      if (typeof val === 'number') {
        return this.changeRem(val);
      }
      if (typeof val === 'string') {
        if (val.indexOf('px') > -1 ) {
          return this.changeRem(val);
        } else if (val.endsWith('%')) {
          return val;
        }
        return this.changeRem(val);
      }
      return this.changeRem(80);
    },
    display() {
      if (this.inline) {
        return 'inline-block';
      }
      return 'block';
    },
    width() {
      if (this.span) {
        return `calc(100% * (${this.span} / 24))`;
      }
      return '100%';
    },
    heightCup() {
      const val = this.height;
      if (typeof val === 'number') {
        return this.changeRem(val);
      }
      if (typeof val === 'string') {
        return this.changeRem(val);
      }
      return '';
    },
  },
  data() {
    return {
      validateMsgsProp: {
        msgStatus: true,
        validateMessage: '',
      },
      optionsData: []
    };
  },
  created() {
    this.formSubject.subscribe((x) => {
      if (x.prop === 'all') {
        this.validateMsgsProp.msgStatus = x.msgStatus;
      } else if (x.prop === this.prop) {
        if (x.validateMessage) {
          this.validateMsgsProp.validateMessage = x.validateMessage;
        }
        this.validateMsgsProp.msgStatus = x.msgStatus;
      }
    });
    if (this.type === 'radio' && this.$attrs.url) {
      this.getAsyncOptions()
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('handleChange',val,this.prop)
    },
    getAsyncOptions() {
      getDict(this.$attrs.url,this.$attrs.params).then(res => {
        if (res.status === 200) {
          if (this.$attrs.props) {
            const {label, value} = this.props
            this.optionsData = res.data.map(item => {
              item.label = item[label]
              item.value = item[value]
              return item
            })
          }
          this.optionsData = res.data.map(item => {
            item.label = item.value
            return item
          })
        }
      })
    },
    limitNumber(val,num = 2) {
      let value = null
      if (num === undefined || num == null || num === 0) { //正整数
        value = val.replace(/[^0-9]+/g, '');
      } else {
        let re = new RegExp("^\\d+(\\.\\d{0," + num + "})?");
        value = (val.match(re) ? val.match(re)[0] : null) || null;
      }
      this.$emit('input',value)
    },
    // 自适应屏幕转换
    changeRem(number) {
     return (parseFloat(number) * Math.min(this.$scale, 1)) + 'px'
    },
    // 状态值 转换
    stateFormat(state) {
      state = parseInt(state);
      let res = "";
      switch (state) {
        case 0:
          res = "保存";
          break;
        case 1:
          res = "提交";
          break;
        case 2:
          res = "审核通过";
          break;
        case 3:
          res = "退回";
          break;
        case 4:
          res = "驳回";
          break;
        default:
          res = "保存";
          break;
      }
      return res;
    },
    // 时间值转换
    parseTime(time){
    	if(time){
    		return parseTime(parseInt(time),'{y}-{m}-{d}')
    	}
      return ''
    },
  }
};
</script>


<style lang="scss" scoped>
$border-color: #EBEEF3;
$label-bgcolor: #F9FAFD;
.page-form-item {
  font-size: 14px;
  font-family: "PingFangSC";
  position: relative;
  border-top: 1px solid $border-color;
  vertical-align: top;
  overflow: hidden;
  height: 35px;
  color: #4D4D4D;
  border-bottom: 1px solid $border-color;
  .page-form-item-label {
    height: 100%;
    
  }
  .left-border {
    position: absolute;
    height: 100%;
    width: 1px;
    left: 0;
    top: 0;
    background-color: $border-color;
    z-index: 999;
  }
  &-label {
    display: inline-block;
    height: calc(100% - 16px);
    background-color: $label-bgcolor;
    border-right: 1px solid $border-color;
    border-left: 1px solid $border-color;
    text-align: center;
    .require {
      display: inline-block;
      width: 8px;
      color: #F56C6C;
      vertical-align: -3px;
    }
    &__text {
      display: inline-block;
      vertical-align: middle;
      line-height: 1.3em;
      width: 80%;
    }
    &::after {
      content: '';
      display: inline-block;
      vertical-align: middle;
      height: 100%;
    }
  }
  .border-right0 {
    border-right: 0;
  }
  &-content {
    display: inline-block;
    vertical-align: top;
    padding: 8px;
    height: calc(100% - 16px);
    &.noLabel {
      border-left: 1px solid $border-color;
    }
    &::after {
      content: '';
      display: inline-block;
      vertical-align: middle;
      height: 100%;
    }
    &.align-top {
      &::after {
        content: '';
        vertical-align: top;
      }
    }
    &.noPadding {
      padding: 0;
    }
  }
  /deep/ .el-table th {
    background-color: $label-bgcolor;
  }
  /deep/ .el-radio {
    margin-right: 15px;
  }
  /deep/ .el-radio__label {
    font-size: 12px;
  }
  /deep/ .el-input--small .el-input__inner {
    font-size: 12px;
  }
  /deep/ .el-checkbox {
    font-size: 12px;
  }
  /deep/ .el-checkbox__label {
    font-size: 12px;
    vertical-align: -2px;
  }
  /deep/ .el-select {
    width: 100%;
  }
  /deep/ .el-cascader {
    width: 100%;
  }
  /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%;
  }
  /deep/ .el-form-item.is-success .el-input__inner,
  /deep/ .el-form-item.is-success .el-input__inner:focus,
  /deep/ .el-form-item.is-success .el-textarea__inner,
  /deep/ .el-form-item.is-success .el-textarea__inner:focus {
    border-color: #DCDFE6;
  }
  /deep/ .el-textarea__inner {
    height: 80px;
  }
  .page-form-item-content {
    height: 100%;
    overflow: hidden;
    /deep/ .el-form-item {
      margin-bottom: 0;
      .el-input__inner {
        /*height: 100%;*/
      }
      /deep/.is-disabled .el-input__inner,.el-textarea__inner,.el-radio__label {
        color: #4D4D4D;
        /*background: #fff;*/
      }
    }
    .text-box {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      cursor: pointer;
    }
    .slider-box {
      display: flex;
      justify-content: space-between;
      &:first-child {
        flex: 1;
      }
    }
  }
}
.cell-input {
  border: 0;
  height: auto;
  min-height: 66px;
  padding-top: 12px;
  .page-form-item-content {
    padding: 0;
    width: 100%;
    border: 0;
    overflow: initial;
  }
}
</style>
<style lang="scss">
  .page-form-item-tooltip {
    &.el-tooltip__popper.is-light {
      border: 1px solid #F56C6C;
      color: #F56C6C;
    }
    &.el-tooltip__popper.is-light[x-placement^="top"] .popper__arrow {
      border-top-color: #F56C6C;
    }
  }
</style>
