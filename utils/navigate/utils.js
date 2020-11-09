
const formatRoute = (route) => {
  if (route.indexOf(0) == '.') {
    throw new Error('请使用绝对路径')
  }

  if (route.indexOf(0) !== '/') {
    route = '/' + route
  }

  if (route.indexOf('?') > -1) {
    route = route.split('?')[0]
  }
  return route
}


module.exports = {
  formatRoute
}