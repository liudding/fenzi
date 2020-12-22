// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {

  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: event.content
    })
    return result
  } catch (err) {
    return err;
  }
}