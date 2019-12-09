<template>
  <div class="card_wrap">
    <div class="card_head" v-show="showHead">
      <div class="card_head_prefix">
        <slot name="head_prefix">
          <span class="dot"></span>
          <span class="title">{{ title }}</span>
        </slot>
      </div>

      <div class="card_head_center">
        <slot name="head_center">
        </slot>
      </div>

      <div class="card_head_suffix">
        <slot name="head_suffix">
        </slot>
      </div>

    </div>
    <div class="card_container">
      <slot>

      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'card',
  props: {
    title: {
      type: String,
      default: '基本信息'
    },
    showHead: {
      type: Boolean,
      default: false
    }
  },
  data() {
      return {}
  },
  methods: {},
  created() {

  }
}
</script>

<style scoped lang="scss">
.card_wrap{
  background: #ffffff;
  margin: 10px;
  font-family: PingFangSC;
  .card_head{
    padding: 16px 20px 10px 20px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    .dot{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      background-color: #4A75D0;
      margin-right: 5px;
    }
    .title {
      color: #4D4D4D;
      font-size: 14px;
      font-weight:bold;
    }
    .card_head_prefix{
      flex: 1;
    }
    .card_head_suffix{
      flex: 2;
      display: flex;
      justify-content: flex-end;
    }
  }
  .card_head_center{
    flex: 2;
  }
  .card_container{
    padding: 10px 20px 20px;
  }
}
</style>
