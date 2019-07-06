const types = {
  functions: {
    default: {
      description: 'Deploys an instance of this component',
      inputs: {
        name: {
          description: 'The name of this instance of this component',
          type: 'string',
          required: true,
        },
        description: {
          description: 'The description of this instance of this component',
          type: 'string',
          required: true,
        },
        code: {
          description: 'The directory which contains your back-end code, declared by an index.js file',
          type: 'code',
          defaultRuntime: 'nodejs10.x',
          required: true,
          runtimes: [
            'nodejs10.x',
            'nodejs8.10',
          ]
        },
        region: {
          description: 'The AWS region this should be located in',
          type: 'arrayString',
          default: 'us-east-1',
          required: true,
          array: [
            'us-east-1',
            'us-east-2',
            'us-west-1',
            'us-west-2',
            'ap-east-1',
            'ap-south-1',
            'ap-northeast-1',
            'ap-northeast-2',
            'ap-southeast-1',
            'ap-southeast-2',
            'ca-central-1',
            'cn-north-1',
            'cn-northwest-1',
            'eu-central-1',
            'eu-west-1',
            'eu-west-2',
            'eu-west-3',
            'eu-north-1',
            'sa-east-1',
            'us-gov-east-1',
            'us-gov-west-1',
          ]
        },
        memory: {
          description: 'The memory size of the AWS Lambda function running the back-end code.  Increased memory size will result in faster performance, reduced cold-start times, but also higher cost',
          type: 'arrayNumber',
          required: true,
          default: 896,
          array: [
            128,
            384,
            512,
            896,
            1280,
            2048,
            2560,
            3008,
          ]
        },
        timeout: {
          description: 'The number of seconds which the AWS Lambda function running the back-end code can run for',
          type: 'number',
          required: true,
          default: 9,
          max: 900,
          min: 3,
        },
        env: {
          description: 'The environment variables to add in the AWS Lambda function running the back-end code',
          type: 'secrets',
          required: false,
        },
      },
    },
    remove: {
      description: 'Removes this instance of this component',
      inputs: {}
    }
  }
}

module.exports = types
