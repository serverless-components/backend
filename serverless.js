const path = require('path')
const types = require('./serverless.types.js')
const { Component, utils } = require('@serverless/core')

const generateName = (name = 'backend', stage = 'dev') => {
  const shortId = Math.random()
    .toString(36)
    .substring(6)

  return `${name}-${stage}-${shortId}`
}

class Backend extends Component {

  types() { return types }

  async default(inputs = {}) {
    inputs.stage = inputs.stage || 'dev'
    inputs.code = inputs.code ? path.resolve(inputs.code) : path.join(process.cwd(), './test')

    if (!(await utils.fileExists(path.join(inputs.code, 'index.js')))) {
      throw Error(`no index.js file found in the directory "${inputs.code}"`)
    }

    this.context.status('Starting Deployment')
    const name = this.state.name || generateName(inputs.name, inputs.stage)

    const bucket = await this.load('@serverless/aws-s3')
    const role = await this.load('@serverless/aws-iam-role')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')

    this.context.status('Deploying Bucket')
    await bucket({ name, region: inputs.region })

    this.context.status('Deploying Role')
    const roleOutputs = await role({
      name,
      region: inputs.region,
      service: 'lambda.amazonaws.com'
    })

    const lambdaInputs = {
      name,
      description: inputs.description || 'A function for a Backend Component',
      memory: inputs.memory || 128,
      timeout: inputs.timeout || 10,
      runtime: 'nodejs8.10',
      code: inputs.code,
      role: roleOutputs,
      handler: 'shim.handler',
      shims: [path.join(__dirname, 'shim.js')],
      env: inputs.env || {},
      bucket: name,
      region: inputs.region
    }

    this.context.status('Deploying Lambda')
    const lambdaOutputs = await lambda(lambdaInputs)

    const apigInputs = {
      name: `${name}-apig`,
      stage: inputs.stage,
      description: 'An API for a Backend component',
      endpoints: [
        {
          path: '/',
          method: 'any',
          function: lambdaOutputs.arn
        },
        {
          path: '/{proxy+}',
          method: 'any',
          function: lambdaOutputs.arn
        }
      ]
    }

    if (inputs.region) {
      apigInputs.region = inputs.region
    }

    this.context.status('Deploying API Gateway')
    const apigOutputs = await apig(apigInputs)

    this.state.name = name
    await this.save()

    this.context.log()
    this.context.output('url', apigOutputs.url)

    return { url: apigOutputs.url }
  }

  async remove() {
    this.context.status('Removing')

    const role = await this.load('@serverless/aws-iam-role')
    const bucket = await this.load('@serverless/aws-s3')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')

    await role.remove()
    await bucket.remove()
    await lambda.remove()
    await apig.remove()

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = Backend
