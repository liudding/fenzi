// components/gift-group/gift-group.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    group: {
      type: Object
    }
  },

  data: {
    folded: true,

    hasExpanded: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapGroup() {
      if (!this.data.hasExpanded) {
        this.setData({
          hasExpanded: true
        })
      }

      this.setData({
        folded: !this.data.folded
      })
    },

    onTapAdd() {
      this.triggerEvent('tapAddItem', {
        event: this.data.group.event,
        date: this.data.group.date,
        is_income: this.data.group.is_income
      })
    },

    onTapItem(e) {
      let index = e.currentTarget.dataset.index
      let gift = this.data.group.gifts[index]

      this.triggerEvent('tapItem', gift)
    }
  }
})
