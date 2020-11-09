export function updateCache(data) {
  try {
    let gifts = wx.getStorageSync("GIFTS") || [];

    let idx = gifts.findIndex(item => item._id === data._id);
    if (idx >= 0) {
      if (data.delete) {
        gifts.splice(idx, 1);
      } else {
        gifts.splice(idx, 1, data);
      }
    } else {
      gifts.push(data);
    }

    wx.setStorage({
      key: 'GIFTS',
      data: gifts
    });
    
  } catch (err) {
    console.error('updateCache error: ', err)
  }
}
