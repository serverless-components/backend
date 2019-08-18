const path = require('path')
const { getPolicy } = require('./utils')
const types = require('./serverless.types.js')
const { Component, utils } = require('@serverless/core')

/**
 * Component: Backend
 */

class Backend extends Component {
  /**
   * Types
   */

  types() {
    return types
  }

  /**
   * Default
   */

  async default(inputs = {}) {
    this.context.status('Deploying')

    inputs.region = inputs.region || 'us-east-1'

    // Default to current working directory
    inputs.code = inputs.code || {}
    inputs.code.root = inputs.code.root ? path.resolve(inputs.code.root) : process.cwd()
    if (inputs.code.src) {
      inputs.code.src = path.join(inputs.code.root, inputs.code.src)
    }

    let exists
    if (inputs.code.src) {
      exists = await utils.fileExists(path.join(inputs.code.src, 'index.js'))
    } else {
      exists = await utils.fileExists(path.join(inputs.code.root, 'index.js'))
    }

    if (!exists) {
      throw Error(
        `No index.js file found in the directory "${inputs.code.src || inputs.code.root}"`
      )
    }

    // If a hook is provided, build the assets
    if (inputs.code.hook) {
      this.context.status('Building assets')
      this.context.debug(`Running ${inputs.code.hook} in ${inputs.code.root}.`)

      const options = { cwd: inputs.code.root }
      try {
        await exec(inputs.code.hook, options)
      } catch (err) {
        console.error(err.stderr) // eslint-disable-line
        throw new Error(
          `Failed building website via "${inputs.code.hook}" due to the following error: "${err.stderr}"`
        )
      }
    }

    const bucket = await this.load('@serverless/aws-s3')
    const role = await this.load('@serverless/aws-iam-role')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')
    const domain = await this.load('@serverless/domain')

    this.context.status('Deploying AWS S3 Bucket')
    const bucketOutputs = await bucket({
      name: 'backend-' + this.context.resourceId(),
      region: inputs.region
    })

    this.context.status('Deploying AWS IAM Role')

    const roleInputs = {
      name: 'backend-' + this.context.resourceId(),
      region: inputs.region,
      service: 'lambda.amazonaws.com',
      policy: getPolicy(inputs.permissions)
    }

    const roleOutputs = await role(roleInputs)

    this.context.status('Deploying AWS Lambda & Uploading Code')
    const lambdaInputs = {
      name: 'backend-' + this.context.resourceId(),
      description: inputs.description || 'A function for the Backend Component',
      memory: inputs.memory || 896,
      timeout: inputs.timeout || 10,
      runtime: 'nodejs8.10',
      code: inputs.code.src || inputs.code.root,
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
      region: inputs.region,
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

    const apigOutputs = await apig(apigInputs)

    const outputs = { url: apigOutputs.url }

    if (inputs.domain) {
      const subdomain = inputs.domain.split('.')[0]
      const secondLevelDomain = inputs.domain.replace(`${subdomain}.`, '')

      const domainInputs = {
        domain: secondLevelDomain,
        subdomains: {},
        region: inputs.region
      }

      domainInputs.subdomains[subdomain] = apigOutputs
      const domainOutputs = await domain(domainInputs)

      outputs.domain = domainOutputs.domains[0]
    }

    this.state.url = apigOutputs.url
    this.state.domain = apigOutputs.domain
    await this.save()

    return outputs
  }

  /**
   * Remove
   */

  async remove() {
    this.context.status('Removing')

    const role = await this.load('@serverless/aws-iam-role')
    const bucket = await this.load('@serverless/aws-s3')
    const lambda = await this.load('@serverless/aws-lambda')
    const apig = await this.load('@serverless/aws-api-gateway')
    const domain = await this.load('@serverless/domain')

    this.context.status('Removing AWS IAM Role')
    await role.remove()
    this.context.status('Removing AWS S3 Bucket')
    await bucket.remove()
    this.context.status('Removing AWS Lambda')
    await lambda.remove()
    this.context.status('Removing AWS API Gateway')
    await apig.remove()
    this.context.status('Removing Domain')
    await domain.remove()

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = Backend
