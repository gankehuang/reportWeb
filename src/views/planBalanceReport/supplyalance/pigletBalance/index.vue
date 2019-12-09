<template>
  <div ref="pageContent" class="swine-warp">
    <formTitle title="月度猪苗平衡表">
      <div slot="context">
        <div class="entry-warp">
          <vxe-table
            border
            ref="xTable"
            highlight-hover-row
            :resizable="true"
            :height="childTableHeight"
            :data="entryData"
            show-footer
            :footer-method="footerMethod"
          >
            <vxe-table-column type="index" title="序号" fixed="left" width="60"></vxe-table-column>
            <vxe-table-column
              field="unitName"
              title="单位名称"
              class-name="unit-name"
              fixed="left"
              width="100"
            ></vxe-table-column>
            <vxe-table-column title="猪苗平衡结果">
              <vxe-table-column
                field="balanceSubtotal"
                title="小计"
                class-name="total_1"
                header-align="center"
                align="right"
                width="80"
              >
                <template v-slot="{ row }">{{ rounding(row.balanceSubtotal) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="balance17day"
                title="1-7日平衡"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.balance17day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="balance814day"
                title="8-14日平衡 "
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.balance814day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="balance1521day"
                title="15-21日平衡"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.balance1521day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="balance2230day"
                title="22-30日平衡"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.balance2230day) }}</template>
              </vxe-table-column>
            </vxe-table-column>
            <vxe-table-column title="繁殖-出苗">
              <vxe-table-column
                field="outSubtotal"
                title="计划出栏数"
                class-name="total_2"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.outSubtotal) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="out17day"
                title="1-7日出栏数"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.out17day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="out814day"
                title="8-14日出栏数"
                header-align="center"
                align="right"
                width="110"
              >
                <template v-slot="{ row }">{{ rounding(row.out814day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="out1521day"
                title="15-21日出栏数"
                header-align="center"
                align="right"
                width="120"
              >
                <template v-slot="{ row }">{{ rounding(row.out1521day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="out2230day"
                title="22-30日出栏数"
                header-align="center"
                align="right"
                width="120"
              >
                <template v-slot="{ row }">{{ rounding(row.out2230day) }}</template>
              </vxe-table-column>
            </vxe-table-column>
            <vxe-table-column title="育肥-投苗">
              <vxe-table-column
                field="inSubtotal"
                title="计划投苗数"
                class-name="total_3"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.inSubtotal) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="in17day"
                title="1-7日投苗数"
                header-align="center"
                align="right"
                width="100"
              >
                <template v-slot="{ row }">{{ rounding(row.in17day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="in814day"
                title="8-14日投苗数"
                header-align="center"
                align="right"
                width="110"
              >
                <template v-slot="{ row }">{{ rounding(row.in814day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="in1521day"
                title="15-21日投苗数"
                header-align="center"
                align="right"
                width="120"
              >
                <template v-slot="{ row }">{{ rounding(row.in1521day) }}</template>
              </vxe-table-column>
              <vxe-table-column
                field="in2230day"
                title="22-30日投苗数"
                header-align="center"
                align="right"
                width="120"
              >
                <template v-slot="{ row }">{{ rounding(row.in2230day) }}</template>
              </vxe-table-column>
            </vxe-table-column>
          </vxe-table>
        </div>
      </div>
      <div class="content-head" slot="title-suffix">
        <el-button
          class="export-btn"
          size="small"
          icon="el-icon-upload2"
          @click="exportDataEvent"
          :disabled="loading"
        >导出</el-button>
        <el-button
          size="small"
          icon="el-icon-rank"
          @click="handleFullscreen"
        >{{fullscreen?'退出全屏':'全屏'}}</el-button>
      </div>
    </formTitle>
  </div>
</template>

<script>
import { getList, getTree } from "@/api/pigletBalance";
import treeSelect from "@/components/TreeSelect";
import formTitle from "@/components/formTitle/formTitle";
import { mapGetters } from "vuex";
import axios from 'axios'
import { getToken } from '@/utils/auth'

export default {
  name: "index",
  components: { treeSelect, formTitle },
  created() {
    // 获取组织树
    /* getTree()
      .then(res => {
        if (res.status == 200) {
          this.treeData = res.data;
        }
      })
      .catch(err => {
        this.$message({
          message: "获取组织失败！",
          type: "error"
        });
      }); */
    this.form.orgName = this.$store.getters.orgInfo.name;
    this.form.orgIdQuery = this.$store.getters.orgInfo.id;
    this.form.orgLongNumQuery = this.$store.getters.orgInfo.longNumber;
    this.form.timeDataQuery = new Date(this.$store.getters.planYearMonth);
    this.form.typeQuery = this.$store.getters.orgInfo.type;
    this.getList();
  },
  computed: {
    ...mapGetters(["orgInfo", "planYearMonth"])
  },
  // 监听执行
  watch: {
    orgInfo(val) {
      this.form.orgName = this.$store.getters.orgInfo.name;
      this.form.orgIdQuery = this.$store.getters.orgInfo.id;
      this.form.orgLongNumQuery = this.$store.getters.orgInfo.longNumber;
      this.form.timeDataQuery = new Date(this.$store.getters.planYearMonth);
      this.form.typeQuery = this.$store.getters.orgInfo.type;
      this.getList();
    },
    planYearMonth(val) {
      this.form.orgName = this.$store.getters.orgInfo.name;
      this.form.orgIdQuery = this.$store.getters.orgInfo.id;
      this.form.orgLongNumQuery = this.$store.getters.orgInfo.longNumber;
      this.form.timeDataQuery = new Date(this.$store.getters.planYearMonth);
      this.form.typeQuery = this.$store.getters.orgInfo.type;
      this.getList();
    }
  },
  data() {
    return {
      childTableHeight: 300, // 子表高度
      form: {
        orgName: "",
        orgIdQuery: "",
        orgLongNumQuery: "",
        timeDataQuery: new Date(),
        typeQuery: ""
      },
      type: "",
      orgId: "",
      orgName: "",
      orgLongNum: "",
      treeData: [],
      props: {
        label: "name",
        value: "longNumber"
      },
      entryData: [],
      loading: false,
      fullscreen: ""
    };
  },
  mounted() {
    window.onresize = () => {
      // this.fullscreen = this._isFullscreenEnable()
      // 动态监听窗口大小
      return (() => {
        this.computedDOMHeight();
      })();
    };

    this.$nextTick(() => {
      // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight();
      this._onFullscreenchange();
    });
  },
  methods: {
    // 数值取整
    rounding(data) {
      if (data && data != "" && data != 0) {
        return Math.round(data);
      } else {
        return "-";
      }
    },
    getList() {
      getList(this.form).then(res => {
        if (res.status === 200) {
          this.entryData = res.data;
        }
      });
    },
    footerMethod({ columns, data }) {
      return [
        columns.map((column, columnIndex) => {
          if (columnIndex === 0) {
            return "合计";
          } else if (columnIndex === 1) {
            return null;
          } else {
            return this.sum(data, column.property);
          }
          return null;
        })
      ];
    },
    sum(data, key) {
      let num = 0;
      data.forEach(ele => {
        num += parseInt(ele[key] ? ele[key] : 0);
      });
      return num;
    },
    /* exportDataEvent() {
      this.$refs.xTable.exportData({ type: 'xml' })
    }, */
    computedDOMHeight() {
      let curClientHeight = document.body.clientHeight; // 当前屏幕高度
      let pageContentHeight =
        curClientHeight - this.$refs.pageContent.getBoundingClientRect().top;
      this.$refs.pageContent.style.height = pageContentHeight - 10 + "px";

      let contentHeadHeight = document.querySelectorAll(".content-head")[0]
        .offsetHeight;

      this.childTableHeight = pageContentHeight - contentHeadHeight - 70;
    },
    handleFullscreen() {
      let fullarea = this.$refs.pageContent;
      if (this.fullscreen) {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        // 进入全屏
        if (fullarea.requestFullscreen) {
          fullarea.requestFullscreen();
        } else if (fullarea.webkitRequestFullScreen) {
          fullarea.webkitRequestFullScreen();
        } else if (fullarea.mozRequestFullScreen) {
          fullarea.mozRequestFullScreen();
        } else if (fullarea.msRequestFullscreen) {
          // IE11
          fullarea.msRequestFullscreen();
        }
      }
      // this.fullscreen = !this.fullscreen;
    },
    _isFullscreenEnable() {
      return (
        document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullscreen ||
        false
      );
    },
    _onFullscreenchange() {
      document.addEventListener(
        "fullscreenchange",
        () => {
          this.fullscreen = this._isFullscreenEnable();
        },
        false
      );
      document.addEventListener(
        "mozfullscreenchange",
        () => {
          this.fullscreen = this._isFullscreenEnable();
        },
        false
      );
      document.addEventListener(
        "webkitfullscreenchange",
        () => {
          this.fullscreen = this._isFullscreenEnable();
        },
        false
      );
      document.addEventListener(
        "msfullscreenchange",
        () => {
          this.fullscreen = this._isFullscreenEnable();
        },
        false
      );
    },
    // 导出
    exportDataEvent() {
      /* let commitData = {
        delectIds: this.entryIds,
        lord: this.mainTableData,
        entrys: this.tableData
      }; */

      this._exportMethod({
        url: "/PigBalanceController/exportExcel",
        method: "post",
        data: this.form,
        fileName: "月度猪苗平衡表"
      });
    },
    _exportMethod(data) {
      axios({
        method: data.method,
        url: `${process.env.BASE_API}/BUSINESSREPORT/${data.url}`,
        responseType: "blob",
        timeout: 1000 * 30,
        data: data.data,
        headers: {
          Authentication: `${getToken()}`,
          filename: "utf-8"
        }
      })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", data.fileName + ".xlsx");
          document.body.appendChild(link);
          link.click();
        })
        .catch(function(reason) {
          console.log("catch:", reason);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.swine-warp {
  // margin: 10px;
  // background-color: white;
  // background-color: #FFFDF3;
  // padding: 10px 20px;
  /* .entry-warp {
    margin: 10px 0;
  } */
  .export-btn {
    border: 1px solid rgba(25, 137, 250, 1);
    color: rgba(0, 136, 255, 1);
  }
  /deep/ .vxe-table.t--border .vxe-table--fixed-left-wrapper {
    .col--index {
      background-color: #f8f8f9;
    }
    .unit-name {
      background-color: #f8f8f9;
      &:last-child {
        background-color: #fffdf3;
      }
    }
  }
  /deep/
    .vxe-table--main-wrapper
    .vxe-table--body-wrapper
    .vxe-table--body
    .vxe-body--row {
    .total_1 {
      background-color: rgb(245, 250, 252);
    }
    .total_2 {
      background-color: rgb(245, 250, 252);
    }
    .total_3 {
      background-color: rgb(245, 250, 252);
    }
  }
}
</style>