
Component({

  properties: {
    show: {
      type: Boolean,
      value: false
    },
    position: {
      type: String,
      value: 'bottom',
      observer: function (newVal, oldVal) {
        this._checkPosition(newVal)
      }
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    cancelText: {
      type: String,
      value: '取消',
    },
    showConfirm: {
      type: Boolean,
      value: true
    },
    showMask: {
      type: Boolean,
      value: true
    },
    hideWhenClickMask: {
      type: Boolean,
      value: true
    }
  },

  data: {

  },

  created() {
    this._checkPosition(this.data.position)
  },

  methods: {
    _checkPosition(pos) {
      if (['bottom', 'top', 'left', 'right', 'center'].indexOf(pos) < 0) {
        throw new Error('不支持的 position')
      }
    },

    _handleMaskClick(event) {
      if (!this.data.hideWhenClickMask) {
        return
      }
      this.resolveHide();
    },

    _onCancel() {
      this.triggerEvent('cancel', {})
      this.resolveHide()
    },

    _onConfirm() {
      this.triggerEvent('confirm', {})
      this.resolveHide()
    },

    resolveHide() {
      this.setData({ show: false })
      this.triggerEvent('onhide', {})
    },

    blockTouch(event) {
      // 屏蔽滚动 点击事件
      // catch:touchmove="blockTouch"
    }
  }
})
