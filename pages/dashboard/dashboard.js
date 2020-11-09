var wxCharts = require('../../vendor/wxcharts/wxcharts.js');

const app = getApp();

Page({


  data: {
    gifts: [],

    summary: {
      income: 0,
      outgoing: 0,
      sum: -0
    },

    briefInfos: [{
      title: '给出',
      unit: '笔',
      value: '0'
    },{
      title: '收到',
      value: '0',
      unit: '笔'
    },{
      title: '联系人',
      value: '0',
      unit: '位'
    },{
      title: '事件',
      value: '0',
      unit: '种'
    }],

    hasData: true
  },


  onLoad: function (options) {
   
  },

  onShow: function() {

    this.updateUI();
  }, 

  getEvents(gifts) {
    let events = gifts.map(item => item.event);
    events = Array.from(new Set(events));

    return events
  },

  calcTotal(gifts) {
    return gifts.reduce((acc, item) => {
      return acc + item.amount;
    }, 0);
  },

  updateUI() {

    let gifts = app.globalData.gifts;
   
    if (gifts.length === 0) {
      this.setData({
        hasData: false
      })
      return;
    }

    let incomes = app.globalData.receivedGifts;
    let outgoings = app.globalData.sentGifts;

    let incomes_total = this.calcTotal(incomes)
    let outgoings_total = this.calcTotal(outgoings)

    let events = this.getEvents(gifts)

    this.setData({
      hasData: true,
      summary: {
        income: incomes_total,
        outgoing: outgoings_total,
        sum: incomes_total - outgoings_total
      },
      briefInfos: [{
        title: '给出',
        unit: '笔',
        value: outgoings.length
      },{
        title: '收到',
        value: incomes.length,
        unit: '笔'
      },{
        title: '联系人',
        value: app.globalData.contacts.length,
        unit: '位'
      },{
        title: '事件',
        value: events.length,
        unit: '种'
      }]
    })

    let pieChart = new wxCharts({
      animation: false,
      canvasId: 'pieChart',
      type: 'pie',
      series: [
        {
          name: '收到',
          data: incomes_total,
          color: '#67D5B5'
      },{
          name: '给出',
          data: outgoings_total,
          color: '#EE7785'
      },],
      width: 150,
      height: 150,
      dataLabel: false,
      legend: false
  });
  },

  updateEventChart() {

  },

  onShareAppMessage: function () {

  }
})
