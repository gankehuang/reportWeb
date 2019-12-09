<template>
  <el-form
    class="page-form-container"
    :class="{'rm-bottom-border': rmBottomBorder,'no-border': cellInput}"
    ref="Form"
    :model="model"
    :rules="editable?formRules:null"
    :validate-on-rule-change="false"
    @validate="validate2"
    @submit.native.prevent="onSubmit">
    <form-item
      v-for="(item,index) in options"
      v-bind="item"
      :dynamicOptions="$attrs.dynamicOptions"
      :dynamicDisabled="$attrs.dynamicDisabled"
      :params="$attrs.dynamicParams || item.params"
      v-on="$listeners"
      v-model="model[item.prop]"
      :rules="item.rules || rules[item.prop]"
      :clearable="true"
      :cellInput="cellInput"
      :disabled="item.disabled || !editable"
      @input="handleInput($event, item.prop)"
      :key="index"
    ></form-item>
  </el-form>
</template>

<script>
import FormItem from "./FormItem"
import { Subject } from 'rxjs'
import {deepClone} from "@/utils";

export default {
  components: {
    FormItem
  },
  props: {
    labelWidth: [Number, String],
    rmBottomBorder: {
      type: Boolean,
      default: false
    },
    model: Object,
    rules: {
      type: Object,
      default() {
        return {};
      },
    },
    options: {
      type: Array,
      default: () => ([])
    },
    editable: {
      type: Boolean,
      default: true
    },
    cellInput: Boolean,
    enableValidate: Boolean
  },
  provide() {
    return {
      labelWidth: this.labelWidth,
      rules: this.rules,
      formSubject: this.formSubject,
    };
  },
  data() {
    return {
      validateMsgs: {},
      relationMap: new Map(),
      formSubject: new Subject(),
      formRules: {},
      cascadeMap: new Map(),
      hasInitOptionsProps: []
    };
  },
  watch: {
    model: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.formRules = this.rules
            })
          })
        }
        Object.keys(val).forEach(i => {
          if (this.relationMap.has(i)) {
              const arr = this.relationMap.get(i)
              arr.forEach(itm => {
                if (val[i] === 0 || val[i] == null || val[i] === undefined || val[i] === '') {
                  if (this.model[itm.prop]) {
                    this.$set(this.model,itm.prop,'')
                  }
                  this.options[itm.index].disabled = true
                  this.$nextTick(() => {
                    this.$delete(this.rules,itm.prop)
                    this.clearValidate(itm.prop)
                  })
                } else {
                  this.options[itm.index].disabled = false
                  this.$nextTick(() => {
                    if (['number', 'temperature'].includes(itm.type)) {
                      this.$set(this.rules,itm.prop,[{
                        type: 'number',
                        required: true,
                        message: itm.label+'不能为空',
                        trigger: 'blur',
                        transform (value) {
                          return parseFloat(value)
                        }
                      }])
                    } else {
                      this.$set(this.rules,itm.prop,[{
                        required: true,
                        message: itm.label+'不能为空',
                        trigger: ['blur', 'change']
                      }])
                    }
                  })
                }
              })
          }
          this.initCascadeOptions(val[i], i)
        })
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    if (!Object.keys(this.model).length) {
      this.formRules = this.rules
    }
    this.options.forEach((i, index) => {
      // 关联启用禁用
      if (i.hasOwnProperty('relation')) {
        const obj = {
          prop: i.prop,
          index: index,
          label: i.label,
          type: i.type
        }
        i.disabled = true
        if (this.relationMap.has(i.relation)) {
         const arr = this.relationMap.get(i.relation)
          if (arr.findIndex(itm => itm.index === i.index ) === -1) {
            arr.push(obj)
            this.relationMap.set(i.relation,arr)
          }
        } else {
          this.relationMap.set(i.relation,[obj])
        }
      }
      if (i.hasOwnProperty('cascade')) {
        let parentField =''
        if (i.params) {
          Object.keys(i.params).forEach( itm=> {
            if (!i.params[itm]) {
              parentField = itm
            }
          })
        }
        const obj = {
          prop: i.prop,
          index: index,
          label: i.label,
          type: i.type,
          url: i.url,
          multiple: i.multiple,
          parentField
        }
        if (this.cascadeMap.has(i.cascade)) {
         const arr = this.cascadeMap.get(i.cascade)
          if (arr.findIndex(itm => itm.index === i.index ) === -1) {
            arr.push(obj)
            this.cascadeMap.set(i.cascade,arr)
          }
        } else {
          this.cascadeMap.set(i.cascade,[obj])
        }
      }
    })
  },
  methods: {
    onSubmit() {
      return false;
    },
    validate(fn) {
      this.$refs.Form.validate(fn);
    },
    resetFields() {
      this.$refs.Form.resetFields();
      this.formSubject.next({ prop: 'all', msgStatus: true, validateMessage: '' });
    },
    validate2(prop, msgStatus, validateMessage) {
      this.formSubject.next({ prop, msgStatus, validateMessage });
    },
    clearValidate(prop) {
      if (prop) {
        this.$refs.Form.clearValidate(prop);
        this.formSubject.next({ prop, msgStatus: true, validateMessage: '' });
      } else {
        this.$refs.Form.clearValidate();
        this.formSubject.next({ prop: 'all', msgStatus: true, validateMessage: '' });
      }
    },
    handleInput(val, key) {
      this.$emit('input', val);
      this.handlerCascade(val, key)
    },
    // 选项级联处理
    handlerCascade(val, key) {
      if (this.cascadeMap.has(key)) {
        const arr = this.cascadeMap.get(key)
        arr.forEach(obj => {
          this.$set(this.model,obj.prop,obj.multiple ? [] : '')
          if (val) {
            const object = deepClone(this.options[obj.index])
            /*Object.keys(object.params).forEach(key => {
              if (!object.params[key]) {
                object.params[key] = val
              }
            })*/
            object.params[obj.parentField] = val
            this.$set(this.options, obj.index, object)
          }
          this.handlerCascade('', obj.prop)
        })
      }
    },
    // 初始化级联选项
    initCascadeOptions(val,key) {
      if (this.cascadeMap.has(key)) {
        const arr = this.cascadeMap.get(key)
        arr.forEach(obj => {
          if (this.hasInitOptionsProps.includes(obj.prop)) return
          if (val) {
            const object = deepClone(this.options[obj.index])
            object.params[obj.parentField] = val
            this.$set(this.options, obj.index, object)
            this.hasInitOptionsProps.push(obj.prop)
          }
        })
      }
    }
  },
};
</script>


<style lang="scss">
$border-color: #EBEEF3;
.page-form-container {
  //margin-bottom: 0px;
  font-size: 0;
  /*border-top: 1px solid $border-color;*/
  /*border-bottom: 1px solid $border-color;*/
  border-right: 1px solid $border-color;
  .el-form-item--small.el-form-item {
    margin-bottom: 0;
  }
  .el-form-item--small .el-form-item__content {
    line-height: inherit;
    font-size: inherit;
  }
  /*.el-form-item__error {*/
    /*display: none;*/
  /*}*/
  .el-form-item__error {
    padding-top: 1px;
    font-size: 10px;
  }
}
  .rm-bottom-border {
    border-bottom: 0;
  }
  .no-border {
    border: 0
  }
</style>
