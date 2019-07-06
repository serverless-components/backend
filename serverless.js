const path = require('path')
const types = require('./serverless.types.js')
const { Component, utils } = require('@serverless/core')

/**
 * Component: Backend
 */

class Backend extends Component {

  /**
   * Types
   */

  types() { return types }

  /**
   * Default
   */

  async default(inputs = {}) {
    inputs.code = inputs.code ? path.resolve(inputs.code) : null

    if (!inputs.code) {
      throw Error(`"code" is a required input.`)
    }

    if (!(await utils.fileExists(path.join(inputs.code, 'index.js')))) {
      throw Error(`No index.js file found in the directory "${inputs.code}"`)
    }

    this.context.status('Starting Deployment')

    const bucket = await this.load('@serverless/aws-s3')
    const role = await this.load('@serverless/aws-iam-role')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')

    this.context.status('Deploying AWS S3 Bucket')
    const bucketOutputs = await bucket({
      backend: 'backend-' + this.context.resourceId(),
      region: inputs.region
    })

    this.context.status('Deploying AWS IAM Role')
    const roleOutputs = await role({
      name: 'backend-' + this.context.resourceId(),
      region: inputs.region,
      service: 'lambda.amazonaws.com'
    })

    this.context.status('Deploying AWS Lambda')
    const lambdaInputs = {
      name: 'backend-' + this.context.resourceId(),
      description: 'A function for a Backend Component',
      memory: inputs.memory || 128,
      timeout: inputs.timeout || 10,
      runtime: 'nodejs8.10',
      code: inputs.code,
      role: roleOutputs,
      handler: 'shim.handler',
      shims: [path.join(__dirname, 'shim.js')],
      env: inputs.env || {},
      bucket: bucketOutputs.name,
      region: inputs.region
    }
    const lambdaOutputs = await lambda(lambdaInputs)

    this.context.status('Deploying AWS API Gateway')
    const apigInputs = {
      name: 'backend-' + this.context.resourceId(),
      stage: 'production',
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

    const apigOutputs = await apig(apigInputs)

    this.state.url = apigOutputs.url
    await this.save()

    this.context.output('url', apigOutputs.url)

    return { url: apigOutputs.url }
  }

  /**
   * Remove
   */

  async remove() {
    this.context.status('Removing all resources')

    const role = await this.load('@serverless/aws-iam-role')
    const bucket = await this.load('@serverless/aws-s3')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')

    this.context.status('Removing AWS IAM Role')
    await role.remove()
    this.context.status('Removing AWS S3 Bucket')
    await bucket.remove()
    this.context.status('Removing AWS Lambda')
    await lambda.remove()
    this.context.status('Removing AWS API Gateway')
    await apig.remove()

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = Backend
