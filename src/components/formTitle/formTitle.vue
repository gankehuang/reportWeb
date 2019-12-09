<template>
  <div class="form-warp">

    <div class="title-box">
      <div class="title-left">
        <span class="dot"></span>
        <span class="title">{{title}}</span>
      </div>

      <div class="title-suffix">
        <slot name="title-suffix"></slot>
      </div>
    </div>

    <div v-show="collapse" class="content-warp">
      <slot name="context"></slot>
    </div>
  </div>
</template>

<script>
    export default {
        name: "formTitle",
        props: {
            title: {
                type: String
            },
            titleGray: {
                type: String,
                default: ''
            },
            defaultOpen: { // 默认展开
                type: Boolean,
                default: true
            },
            isCollapse: { // 默认展开
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                collapse: this.defaultOpen
            };
        }
    };
</script>

<style lang="scss" scoped>
  .form-warp {
    background: #ffffff;
    padding: 16px 20px;
    margin: 10px 10px 0 10px;
    .title-box {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .title-left {
        flex: 0 0 30%;

        .dot {
          display: inline-block;
          margin-right: 10px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #4A75D0;
        }

        .title {
          color: #4d4d4d;
          font-size: 14px;
          font-family: PingFangSC;
          font-weight: 600;
        }
      }

      .title-suffix {
        flex: 0 0 70%;
        text-align: right;
      }

      .icon {
        cursor: pointer;
      }
    }

    .content-warp {
      .page-form-container {
        margin-bottom: 0 !important;
      }
    }

  }
</style>
