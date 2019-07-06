const main = require('./index.js')

module.exports.handler = async (e, ctx, cb) => {
  let res = main
  if (typeof main === 'function') {
    res = await main(e, ctx, cb)
  }

  if (typeof res === 'number') {
    return {
      statusCode: res
    }
  }

  if (typeof res === 'string') {
    return {
      statusCode: 200,
      body: res
    }
  }

  if (typeof res === 'object') {
    if (typeof res.body === 'object') {
      res.body = JSON.stringify(res.body)
    }
    if (res.statusCode) {
      return res
    }

    if (res.headers || res.body) {
      return {
        statusCode: 200,
        ...res
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(res)
    }
  }

  return res
}
