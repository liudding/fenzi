var wxCharts = require('../../vendor/wxcharts/wxcharts.js');
import { groupBy, sumBy } from '../../utils/util'

const app = getApp();

Page({


  data: {
    gifts: [],

    summary: {
      income: 0,
      outgoing: 0,
      sum: -0
    },
    hasData: true
  },


  onLoad: function (options) {

  },

  onShow: function () {

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
      incomeCount: incomes.length,
      outgoingCount: outgoings.length,
      contactCount: app.globalData.contacts.length,
      eventCount: events.length
    })

    let pieChart = new wxCharts({
      animation: false,
      canvasId: 'pieChart',
      type: 'pie',
      series: [{
        name: '收到',
        data: incomes_total,
        color: '#2ABB9B'
      }, {
        name: '送出',
        data: outgoings_total,
        color: '#E26A6A'
      }, ],
      width: 150,
      height: 150,
      dataLabel: false,
      legend: false
    });

    this.updateOutgoingEventChart()

    this.updateIncomeEventChart()
  },

  updateOutgoingEventChart() {
    let outgoings = app.globalData.sentGifts;

    if (outgoings.length === 0) {
      return;
    }

    let group = groupBy(outgoings, 'event');

    let events = []
    for (let key in group) {
      let amount = sumBy(group[key], 'amount')
      events.push({
        event: key,
        amount
      })
    }

    const series = events.map(item => {
      return {
        name: item.event,
        data: item.amount,
        format: () => {
          return item.event + ' ' + item.amount + '元'
        }
      }
    })

    let pieChart = new wxCharts({
      animation: false,
      canvasId: 'outgoing-event-chart',
      type: 'pie',
      background: '#FF7700',
      series: series,
      width: app.device.screenWidth,
      height: 300,
      dataLabel: true,
      legend: false
    });
  },

  updateIncomeEventChart() {
    let gifts = app.globalData.receivedGifts;

    if (gifts.length === 0) {
      return;
    }

    let group = groupBy(gifts, 'event');

    let events = []
    for (let key in group) {
      let amount = sumBy(group[key], 'amount')
      events.push({
        event: key,
        amount
      })
    }

    const series = events.map(item => {
      return {
        name: item.event,
        data: item.amount,
        format: () => {
          return item.event + " " + item.amount + '元'
        }
      }
    })

    let pieChart = new wxCharts({
      animation: false,
      canvasId: 'income-event-chart',
      type: 'pie',
      background: '#FF7700',
      series: series,
      width: app.device.screenWidth,
      height: 300,
      dataLabel: true,
      legend: false
    });
  },

  onShareAppMessage: function() {
    return {
      title: '记录人情往来份子钱',
      path: '/pages/index/index',
      imageUrl: '../../images/share-cover.png'
    }
  },
  onShareTimeline() {
    return {
      title: '记录人情往来份子钱',
      query: 'from=timeline',
      imageUrl: '../../images/share-cover.png'
    }
  }
})