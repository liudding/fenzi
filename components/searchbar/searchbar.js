
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    focus: {
      type: Boolean,
      value: false
    },
    placeholder: {
      type: String,
      value: '搜索'
    },
    value: {
      type: String,
      value: ''
    },
    search: {
      type: Function,
      value: null
    },
    throttle: {
      type: Number,
      value: 500
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    cancel: {
      type: Boolean,
      value: true
    }
  },
  data: {
    result: []
  },
  lastSearch: Date.now(),
  lifetimes: {
    attached: function attached() {
      if (this.data.focus) {
        this.setData({
          searchState: true
        });
      }
    }
  },
  methods: {
    clearInput: function clearInput() {
      this.setData({
        value: ''
      });
      this.triggerEvent('clear');
    },
    inputFocus: function inputFocus(e) {
      this.triggerEvent('focus', e.detail);
    },
    inputBlur: function inputBlur(e) {
      this.setData({
        focus: false
      });
      this.triggerEvent('blur', e.detail);
    },
    showInput: function showInput() {
      this.setData({
        focus: true,
        searchState: true
      });
    },
    hideInput: function hideInput() {
      this.setData({
        searchState: false
      });
    },
    inputChange: function inputChange(e) {
      var _this = this;

      this.setData({
        value: e.detail.value
      });
      this.triggerEvent('input', e.detail);
      if (Date.now() - this.lastSearch < this.data.throttle) {
        return;
      }
      if (typeof this.data.search !== 'function') {
        return;
      }
      this.lastSearch = Date.now();
      this.timerId = setTimeout(function () {
        _this.data.search(e.detail.value).then(function (json) {
          _this.setData({
            result: json
          });
        }).catch(function (err) {
          console.log('search error', err);
        });
      }, this.data.throttle);
    },
    selectResult: function selectResult(e) {
      var index = e.currentTarget.dataset.index;

      var item = this.data.result[index];
      this.triggerEvent('selectresult', { index: index, item: item });
    }
  }
});