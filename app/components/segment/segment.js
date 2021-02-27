// components/segment/segment.js
Component({

  properties: {
    items: {
      type: Array,
      value: []
    },
    selected: {
      type: Number,
      value: 0,
    }
  },
  observers: {
    selected(val) {
      this.setData({
        selectedIndex: val
      })
    }
  },

  data: {
    selectedIndex: 0
  },

  lifetimes: {
    attached: function () {
      this.setData({
        selectedIndex: this.data.selected
      })
    },
  },
  attached: function () {
    this.setData({
      selectedIndex: this.data.selected
    })
  },

  methods: {
    onTapItem(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.data.selectedIndex) {
        return;
      }

      this.setData({
        selectedIndex: index
      })

      this.triggerEvent('change', index)
    }
  }
})