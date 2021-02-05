
/**
 * 插槽
 * full 整个内容页的插槽
 *  search 搜索条件的插槽
 *  table 数据列表的插槽  table传进height属性，获取表格区的高度
 *  pager 分页的插槽
 *  operation 底部操作的插槽
 */
import { getStyle } from '@/utils/util'
export default {
  
    data () {
        return {
            timer: null, // 定时器
            // searchHeight: 0, // 搜索的高度，解决换行导致的高度不正确
            tableHeight: 500, // 数据列表的高度
            loopCount: 0, // 循环次数
            fn: null // 窗口重新计算高度函数
        }
    },    
    mounted () {
        //this.setContentHeight()
        this.$nextTick(() => {
            
        });
        setTimeout(() => {
            this.getTableHeight()
        }, 200);
        
        this.fn = () => {
            window.removeEventListener('resize', this.fn)
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
              //this.setContentHeight()
              this.getTableHeight()
              window.addEventListener('resize', this.fn, false)
            }, 800)
          }
    },
    activated () {

        this.fn()
        window.addEventListener('resize', this.fn, false)
    },
    watch: {
        '$route.path' () {
          window.removeEventListener('resize', this.fn)
        }
    },
    destroyed () {
        window.removeEventListener('resize', this.fn)
    },
    methods: {
        
        /**
         * 获取表格的高度
         */
        getTableHeight () {
            if (!document.querySelector('.ant-table-header')) {
                this.loopCount++
                if (this.loopCount > 5) {
                    this.$message.error('当前页面的Table未设置sroll，无法实现内容区域滚动。');
                    return
                }
                this.$nextTick(() => {
                    this.loopCount++
                    this.getTableHeight()
                })
                return
            }
            this.setTableHeight()
        },
      
        /**
         * 设置表格高度
         */
        setTableHeight () {
            const search = this.$refs.search ? this.$refs.search.offsetHeight : 10
            const footer = this.$refs.footer ? this.$refs.footer.offsetHeight : 0
            const tableHeader = document.querySelector('.ant-table-header')
            const tableHeaderHeight = tableHeader ? tableHeader.offsetHeight : 0
            const contentHeight = getStyle(this.$refs.view, 'height').replace('px','');
            // const contentMarginBottom = getStyle(tableHeader, 'marginBottom').replace('px','');
            this.tableHeight = parseFloat(contentHeight) - search - footer - tableHeaderHeight + 13;
            // console.log('search', search);
            // console.log('footer', footer);
            // console.log('tableHeaderHeight', tableHeaderHeight);
            // console.log('tableHeight',this.tableHeight);
            // console.log('tableMarginBottom', contentMarginBottom);
            // console.log('contentHeight', contentHeight);
            // this.searchHeight = search
        },
        /**
         * 设置内容区域高度
         */
        setContentHeight () {
            const view = this.$refs.view ? this.$refs.view.offsetHeight : 0
            this.$refs.view.style.height = view + 'px'
        }
    }
}