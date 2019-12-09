<template>
  <div class="upload-box">
    <div class="file-list flex-lic" v-for="(item,index) of fileList" :key="index">
      <el-link @click="getPreviewUrl(item)" target="_blank">
        <svg-icon icon-class='upload-file' style="fill: white"/>
        {{item.name}}
      </el-link>
      <i class="el-icon-error delIcon" @click="removeFile(item)" v-if="!$attrs.disabled"></i>
    </div>
    <div class="file-list flex-lic progress-box" v-show="currentFileName">
     <div>
       <svg-icon icon-class='upload-file' style="fill: white"/>
       {{currentFileName}}
     </div>
      <div>
        <el-progress :percentage="progress" :color="customColors"></el-progress>
      </div>
    </div>
    <el-checkbox-group v-model="fileList"></el-checkbox-group>
    <el-upload
      class="upload"
      :class="$attrs.disabled?'upload-disabled':''"
      v-bind="$attrs"
      v-on="$listeners"
      :action="url"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :show-file-list="showFileList"
      :file-list="fileList"
      :headers="uploadHeaders"
      :on-progress="handleProgress"
      :before-remove="beforeRemove"
      :on-exceed="handleExceed">
      <el-button size="small" type="default" icon="el-icon-upload2">点击上传</el-button>
    </el-upload>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import axios from 'axios'
  export default {
    name: "FromUpload",
    components: {},
    directives: {},
    filters: {},
    mixins: [],
    model: {},
    props: {
      showFileList: Boolean,
      url: {
        type: String,
        default: `${process.env.BASE_API}/BUILD/file/uploadFile`
      },
      value: {
        type: Array,
        default: () => ([])
      },
      previewUrl: {
        type: String,
        default: `${process.env.BASE_API}/BUILD/file/image`
      },
      downUrl: {
        type: String,
        default: `${process.env.BASE_API}/BUILD/file/downFile`
      },
      fileType: String,
      headers: {
        type: Object,
        default:() =>({})
      }
    },
    data() {
      return {
        fileList: [],
        uploadHeaders: {},
        progress: 0,   // 上传进度
        currentFileName: null, // 上传文件名称
        customColors: [
          {color: '#f56c6c', percentage: 20},
          {color: '#e6a23c', percentage: 40},
          {color: '#5cb87a', percentage: 60},
          {color: '#1989fa', percentage: 80},
          {color: '#6f7ad3', percentage: 100}
        ] // 进度条颜色
      }
    },
    computed: {
      ...mapGetters(['token'])
    },
    watch: {
      fileList: {
        handler(val) {
          this.$emit('input',val)
          this.$emit('change',val)
        },
        deep: true
      },
      value: {
        handler(val) {
          this.fileList = val || []
        },
        deep: true,
        immediate: true
      }
    },
    created() {
      this.uploadHeaders = Object.assign(this.headers,{Authentication: this.token})
    },
    methods: {
      handleRemove(file) {
        const fileId = file.id || file.response.data.id
        const index = this.fileList.findIndex(i => i.id === fileId)
        if (index !== -1) {
          this.fileList.splice(index,1)
        }
      },
      removeFile(file) {
        this.beforeRemove(file).then(() => {
          this.handleRemove(file)
        })
      },
      getPreviewUrl(file) {
        if (this.fileType === 'cad') {
          const { getDwgViewUrl } = require('@/utils/dwgUtils')
          window.open(getDwgViewUrl(file.ocfId || file.response.data.ocfId))
        } else if (this.fileType === 'private') { // 下载改为window.open&&添加私有文件下载 updated 2019-10-10
          const fileId = file.id || file.response.data.id
          const url =`${this.downUrl}/${fileId}`
          axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
            headers: {
              Authentication: this.token,
              filename:'utf-8'
            }
          }).then(res => {
            const fileStr = res.headers['content-disposition']
            const fileName = decodeURI(fileStr.substr(fileStr.indexOf('filename=')+9))
            let url = window.URL.createObjectURL(new Blob([res.data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            document.body.appendChild(link)
            link.setAttribute('download', fileName)
            link.target = '_blank'
            link.click()
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
          }).catch(error => {
            console.log(error)
          })
        }else {
          const fileId = file.id || file.response.data.id
          const suffixIndex=file.name.lastIndexOf(".");
          const suffix= file.name.substring(suffixIndex+1).toUpperCase();
          if(["BMP","JPG","JPEG","PNG","GIF"].includes(suffix)){
            window.open(`${this.previewUrl}/${fileId}`)
          } else {
            window.open(`${this.downUrl}/${fileId}`)
          }
        }
      },
      handlePreview(file) {
        const fileId = file.id || file.response.data.id
        const url = `${this.previewUrl}/${fileId}`
        window.open(url,'_blank')
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 ${this.$attrs.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      handleSuccess(response) {
        if (response.status === 200) {
          this.progress = 100
          const index = this.fileList.findIndex(i => i.id === response.data.id || response.data.fileId === i.id)
          if (index === -1) {
            this.fileList.push({id: response.data.id || response.data.fileId, name: response.data.fileName || response.data.name, ocfId: response.data.ocfId})
          }
        } else {
          this.$message.error(response.message[0].message)
        }
        this.currentFileName = null
        this.progress = 0
      },
      handleError() {
        this.$message.error("文件上传失败")
        this.currentFileName = null
        this.progress = 0
      },
      handleProgress(event, file) {
        if (this.progress === 0) {
          this.currentFileName = file.name
        }
        let progress = event.percent.toFixed(2)
        if (progress >= 99.99) {
          progress = 99.99
        }
        this.progress = parseFloat(progress)
      }
    },
  }
</script>

<style scoped lang="scss">
  .upload-box {
    display: flex;
    overflow-x: auto;
    .file-list {
      margin-right: 20px;
      white-space: nowrap;
      i {
        vertical-align: middle;
      }
    }
    .progress-box {
      min-width: 160px;
      overflow: hidden;
      div {
        width: 99%;
        text-align: left;
      }
    }
    .upload {
      display: flex;
      /deep/ .el-upload-list {
        display: flex;
        align-items: center;
        .el-upload-list__item {
          margin-top: 0;
        }
      }
      /deep/ .el-icon-close-tip {
        display: none !important;
      }
    }
    .upload-disabled {
      /deep/ .el-upload {
        display: none;
      }
    }
    &::-webkit-scrollbar {
      width: 10px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      background: rgba(144,147,153,.3);
      :hover {
        background: rgba(144,147,153,.5)
      }
    }
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      border-radius: 10px;
      background: #EDEDED;
    }
  }
</style>
