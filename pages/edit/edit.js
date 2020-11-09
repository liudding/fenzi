import { parseTime, deepClone } from "../../utils/util.js";
import uuid from "../../utils/uid.js";
import { updateCache } from "../../utils/index.js";

const app = getApp();

const db = wx.cloud.database();
const giftCollection = db.collection("gift");

Page({
  data: {
    formData: {
      amount: "",
      contact: {
        name: "",
        relationship: ""
      },
      date: parseTime(new Date(), "{y}-{m}-{d}")
    },
    relationshipRange: ["亲戚", "朋友", "同学", "同事", "邻里", "其他"],

    eventRange: [
      "参加婚礼",
      "参加葬礼",
      "宝宝出生",
      "宝宝满月",
      "宝宝周岁",
      "老人过寿",
      "金榜题名",
      "孩子升学",
      "乔迁新居",
      "新店开业",
      "探望病人",
      "其他"
    ]
  },

  onLoad: function(options) {
    let gift = wx.getPageData();

    wx.setNavigationBarTitle({ title: gift.is_income ? '收份子' : '给份子' });

    this.data.formData = Object.assign(this.data.formData, gift);
    this.setData({
      formData: this.data.formData
    });

  },

  inputChange(e) {
    const { field } = e.currentTarget.dataset;

    if (field === "contact.name") {
      let contact = app.globalData.contacts.find(
        item => item.name === e.detail.value
      );
      let relationship = contact ? contact.relationship : "";

      this.setData({
        [`formData.contact.relationship`]: relationship
      });
    }

    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onDateChange(e) {
    this.setData({
      "formData.date": e.detail.value
    });
  },

  onRelationshipChange(e) {
    this.setData({
      "formData.contact.relationship": this.data.relationshipRange[
        e.detail.value
      ]
    });
  },

  onEventChange(e) {
    this.setData({
      "formData.event": this.data.eventRange[e.detail.value]
    });
  },

  submitForm() {
    if (isNaN(this.data.formData.amount)) {
      wx.showModal({
        title: "提示",
        content: "请填写数字",
        showCancel: false
      });
      return;
    }

    if (this.data.formData.amount <= 0) {
      wx.showModal({
        title: "提示",
        content: "请填写金额",
        showCancel: false
      });
      return;
    }

    if (!this.data.formData.contact.name) {
      wx.showModal({
        title: "提示",
        content: "请填写人物",
        showCancel: false
      });
      return;
    }

    if (!this.data.formData.contact.relationship) {
      wx.showModal({
        title: "提示",
        content: "请选择与人物的关系",
        showCancel: false
      });
      return;
    }

    if (!this.data.formData.event) {
      wx.showModal({
        title: "提示",
        content: "请填写事件",
        showCancel: false
      });
      return;
    }

    if (this.data.formData.amount > 1000000) {
      wx.showModal({
        title: "土豪",
        content: "咱们做个朋友吧",
        showCancel: false
      });
      return;
    }

    let gift = deepClone(this.data.formData);

    let contact = this.resolveContact(gift.contact);
    if (!contact) {
      return;
    }

    gift.contact = contact

    wx.showLoading({
      title: "保存中..."
    });

    const isNewGift = !gift._id

    let id = gift._id
    this.save(gift).then(res => {
      
      gift._id = res._id || id;

      updateCache(gift);

      if (isNewGift) {
        app.addGift(gift)
      } else {
        app.updateGift(gift)
      }

      wx.hideLoading();
      
      wx.naviCallback(gift);

      wx.showToast({
        title: "保存成功",
        icon: "success",
        duration: 2000
      });
      wx.naviBack();
    });
  },

  resolveContact(contact) {
    if (contact.id) return contact;

    // 用户自己填写的联系人
    // 作查重检测

    let matchedContacts = app.globalData.contacts.filter(
      item => item.name === contact.name
    );


    if (matchedContacts.length > 1) {
      wx.showModal({
        title: "人物重名了",
        content: `你有多个叫 ${contact.name}的联系人`,
        showCancel: false
      });
      return;
    }

    if (matchedContacts.length === 1) {
      let matchedContact = matchedContacts[0];
      if (matchedContact.relationship !== contact.relationship) {
        // 关系不匹配
        wx.showModal({
          title: "关系不匹配",
          content: `你已经存在一个叫${contact.name}的联系人，Ta 与你的关系是：${matchedContact.relationship}`,
          showCancel: false
        });
        return;
      }

      // 成功匹配到联系人
      contact = matchedContact;
    } else {
      // 新建联系人
      contact.id = uuid();

      app.globalData.contacts.push(contact)
    }

    return contact;
  },

  onTapDelete() {
    const that = this;

    wx.showModal({
      title: "确定删除吗",
      content: "删除之后不可恢复",
      confirmColor: "#FF6C6C",
      confirmText: "删除",
      success(res) {
        if (!res.confirm) {
          return;
        }

        that.doDelete();
      }
    });
  },

  save(temp) {
    temp.amount = +temp.amount;
    temp.updated_at = Date.parse(new Date()) / 1000;

    delete temp._openid;

    if (temp._id) {
      // 更新
      let id = temp._id
      delete temp._id

      return giftCollection.doc(id).update({
        data: temp
      });
    } else {
      temp.created_at = Date.parse(new Date()) / 1000;

      if (app.globalData.debugModel) {
        temp.fake = true
      }

      return giftCollection.add({
        data: temp
      });
    }
  },

  doDelete() {
    giftCollection
      .doc(this.data.formData._id)
      .remove()
      .then(res => {
        let data = {
          _id: this.data.formData._id,
          delete: true
        };

        updateCache(data);
        app.deleteGift(data);

        wx.showToast({
          title: "删除成功"
        });

        wx.naviBack(data);
      });
  },

  onShareAppMessage: function() {}
});
