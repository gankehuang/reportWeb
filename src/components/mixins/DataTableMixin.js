import {initData} from "@/api/dataTable";
const DEFAULT_PAGE = 1
const DataTableMixin = {
  data() {
    return {
      _url: '',
      _params: {},
      _query: {},
      page: DEFAULT_PAGE,
      offset: 20,
      loading: false, // 是否在加载数据
      list: [],  // 数据列表
      total: 0,
      _dataField: null,
    }
  },
  methods: {
    /**
     * 拉取数据
     * @returns {Promise<any>}
     */
    async dataTableInit() {
      if (!await this.dataTableBeforeInit()) {
        return
      }
      return new Promise((resolve, reject) => {
        this.loading = true
        initData(this._url, this._params).then(res => {
          if (res.data && res.data.list instanceof Array){
            this.list = res.data.list
            this.total = res.data.total
          } else if (res.data instanceof Array && res.data.length) {
            this.list = res.data
          } else {
            this.list = []
          }
          if (this._dataField) {
            this.list =this.list.map(i => i[this._dataField])
          }
          setTimeout(() => {
            this.loading = false
          }, 170)
          resolve(res)
        }).catch(err => {
          this.loading = false
          reject(err)
        })
      })
    },

    /**
     * 初始化参数
     * @returns {boolean}
     */
    dataTableBeforeInit() {
      return true
    },

    /**
     * 翻页
     * @param val
     */
    dataTablePageChange(val) {
      this.page = val
      this.dataTableInit()
    },

    /**
     * 改变每页大小
     * @param val
     */
    dataTableSizeChange(val) {
      this.page = DEFAULT_PAGE
      this.offset = val
      this.dataTableInit()
    },

    /**
     * 搜索
     * @param val
     */
    dataTableSearch(val) {
      this.page = DEFAULT_PAGE
      if (val) {
        this._query = val
      }
      this.dataTableInit()
    },

  }
}

export default DataTableMixin