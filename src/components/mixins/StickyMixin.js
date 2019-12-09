const StickyMixin = {
    data() {
        return {
            headBarRefName: 'headBar'
        }
    },
    mounted() {
        window.addEventListener('scroll', this.sticky)
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.sticky)
    },
    methods: {
        sticky() {
            const getScrollPosition = (el = window) => ({
                x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
                y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
            });
            const height = getScrollPosition().y
            const el = this.$refs[this.headBarRefName]
            if (height > el.offsetHeight) {
                el.style.position = 'fixed'
                el.style.top = 0
                el.style.right = 0
                el.style.zIndex = 1900
                el.style.width = this.$refs.addWarp.offsetWidth + 'px'
                el.parentElement.style.paddingTop = el.offsetHeight + 'px'
            } else {
                el.style.position = ''
                el.style.width = ''
                el.style.zIndex = ''
                el.parentElement.style.paddingTop = ''
            }
        },
    }
}

export default StickyMixin