export default {

    name: 'DataTable',

    inheritAttrs: false,

    props: {
        head: {
            type: Array,
            required: true
        },
        rowKeyField: {
            type: String,
            default: 'id'
        },
        showSelection: {
            type: Boolean,
            default: true
        },
        showNumber: Boolean,
        toolBar: {
            type: Object,
            default: () => ({
                label: '操作',
                hidden: false,
                width: '',
                minWidth: '',
                align: 'center',
                fixed: 'right'
            })
        },
        // 默认自适应当前屏高度
        height: {
            type: [String, Number],
            default: 'auto'
        },
        // 多级嵌套数据 user:{name:'名称'} prop可以定义成user.name
        showOverflowTooltip: { // 内容超出隐藏
            type: Boolean,
            default: true
        }
    },
    render(h) {
        const _this = this;
        const columnRender = function(col, h) {
            if (!col.hasOwnProperty('children') || col.children.length === 0) {
                if (col.hidden === true) return null;
                return h('el-table-column', {
                    props: {
                        ...col,
                        width: _this.changeRem(col.width),
                        minWidth: _this.changeRem(col.minWidth),
                        showOverflowTooltip: col.showOverflowTooltip !== undefined ? col.showOverflowTooltip : _this.showOverflowTooltip,
                        sortable: true,
                    },
                    key: col.columnKey || col.prop,
                    scopedSlots: {
                        default: (props) => {
                            if (col.type === 'slot' && _this.$scopedSlots[col.prop]) {
                                return h('div', [
                                    _this.$scopedSlots[col.prop]({
                                        data: props.row
                                    })
                                ])
                            } else {
                                return h('span', {
                                    style: col.cellStyle && typeof col.cellStyle === "function" ?
                                        col.cellStyle(_this.renderCellValue(props.row, props.column.property), props.row, props.column) : null,
                                    domProps: {
                                        innerHTML: (col.formatter && typeof col.formatter === 'function') ?
                                            col.formatter(_this.renderCellValue(props.row, props.column.property), props.row, props.column) : _this.renderCellValue(props.row, props.column.property)
                                    }
                                })
                            }
                        }
                    }
                })
            } else {
                if (Array.isArray(col.children) && col.children.length) {
                    return h('el-table-column', {
                        attrs: {
                            label: col.label || col.prop
                        }
                    }, [...col.children.map(function(column) {
                        return columnRender(column, h)
                    })])
                }
                console.error(`[ETable warn] children need Array and can't be empty`)
                return null;
            }
        }

        return h('div', {
            class: {
                'data-table-container': true
            }
        }, [
            h('el-table', {
                ref: 'elTable',
                props: {
                    ...this.$attrs,
                    rowKey: _this.rowKeyField,
                    rowClassName: _this.tableRowClassName,
                    height: _this.getTableHeight
                },
                on: {
                    ...this.$listeners,
                    'row-click': this.handleRowClick,
                    'selection-change': this.handleSelection,
                },
                directives: [{
                    name: 'loading',
                    value: _this.$attrs.loading,
                }],
                scopedSlots: {
                    empty: function() {
                        return _this.$slots.empty
                    },
                    append: function() {
                        return _this.$slots.append
                    }
                },
            }, [
                _this.showSelection ? h('el-table-column', {
                    attrs: {
                        type: "selection",
                        align: "center",
                        width: _this.changeRem(60)
                    },
                }) : null,
                _this.showNumber ? h('el-table-column', {
                    attrs: {
                        type: "index",
                        label: "序号",
                        align: "center",
                        width: _this.changeRem(60)
                    },
                }) : null,
                _this.head.map(function(col) { // render column
                    return columnRender(col, h)
                }), !_this.toolBar.hidden ? h('el-table-column', {
                    props: {
                        ..._this.toolBar,
                        width: _this.changeRem(_this.toolBar.width),
                        'class-name': 'tool-bar'
                    },
                    scopedSlots: _this.$scopedSlots.toolbar ? {
                        default: (props) => {
                            return h('div', [
                                _this.$scopedSlots.toolbar({
                                    data: props.row
                                })
                            ])
                        }
                    } : null
                }) : null,
                _this.$slots.default //  slot columns
            ]),
            _this.$attrs.total ? h('div', {
                ref: 'pageContainer',
                class: {
                    'page-container': true
                }
            }, [
                h('el-pagination', {
                    attrs: {
                        background: true,
                        layout: "total, sizes, prev, pager, next, jumper",
                        pageSize: _this.$attrs.offset,
                        total: _this.$attrs.total
                    },
                    on: {
                        ...this.$listeners,
                        'current-change': _this.handlePageChange,
                        'size-change': _this.handleSizeChange
                    },
                })
            ]) : null
        ])
    },

    data() {
        return {
            selectionKey: '',
            tableHeight: 500,
        }
    },
    computed: {
        getTableHeight() {
            if (this.height === 'auto') {
                return this.tableHeight
            } else if (this.height) {
                return this.height
            } else {
                return null
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.autoHeight()
                // setTimeout(() => {
                //   this.doLayout()
                // },300)
        })
    },
    updated() {
        this.$nextTick(() => {
            this.doLayout()
        })
    },
    methods: {
        autoHeight() {
            const pageHeight = this.$refs.pageContainer ? this.$refs.pageContainer.offsetHeight : this.changeRem(62)
            this.tableHeight = window.innerHeight - this.$refs.elTable.$el.getBoundingClientRect().top - pageHeight - this.changeRem(30)
        },
        handleSelection(data) {
            this.$emit("handleSelectionChange", data)
            this.$emit('selection-change', data)
            if (!data.length) {
                this.selectionKey = ''
                return
            }
            this.selectionKey = data.map(i => this.renderCellValue(i, this.rowKeyField))
        },
        tableRowClassName({ row }) {
            if (this.selectionKey.includes(this.renderCellValue(row, this.rowKeyField))) {
                return 'is-selection-row';
            }
            return '';
        },
        doLayout() {
            this.$refs.elTable.doLayout()
        },
        handleRowClick(row, column) {
            if (this.showSelection) {
                this.$refs.elTable.toggleRowSelection(row)
            }
            this.$emit('row-click', row, column)
        },
        handlePageChange(val) {
            this.$emit('current-change', val)
            this.$emit('handlePageChange', val)
        },
        handleSizeChange(val) {
            this.$emit('size-change', val)
            this.$emit('handleSizeChange', val)
        },
        renderCellValue(row, prop) {
            if (!prop) return
            if (prop.indexOf('.') !== -1) {
                const paths = prop.split('.');
                let current = row;
                let result = null;
                for (let i = 0, j = paths.length; i < j; i++) {
                    const path = paths[i];
                    if (!current) break;
                    if (i === j - 1) {
                        result = current[path];
                        break;
                    }
                    current = current[path];
                }
                return result;
            } else {
                return row[prop]
            }
        },
        changeRem(number) {
            if (number == null || number === undefined) return
            return parseFloat(number) * Math.min(this.$scale, 1)
        }
    },
}
