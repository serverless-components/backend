module.exports = {
  credentials: ['amazon_web_services'],
  functions: {
    default: {
      description: 'Deploys an instance of this component',
      inputs: [
        {
          name: 'code',
          type: 'code',
          required: true,
          description:
            'The directory which contains your backend code, declared by an index.js file',
          defaultRuntime: 'nodejs12.x',
          runtimes: ['nodejs12.x', 'nodejs10.x', 'nodejs8.10']
        },
        {
          name: 'region',
          type: 'value',
          valueType: 'string',
          required: true,
          description: 'The AWS region this should be located in',
          default: 'us-east-1',
          options: [
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
            'us-gov-west-1'
          ]
        },
        {
          name: 'env',
          type: 'key_values',
          description: 'Variables you wish to be automatically bundled into your code',
          required: false
        },
        {
          name: 'memory',
          type: 'value',
          valueType: 'number',
          description:
            'The memory size of the AWS Lambda function running the back-end code.  Increased memory size will result in faster performance, reduced cold-start times, but also higher cost',
          required: true,
          default: 896,
          options: [128, 384, 512, 896, 1280, 2048, 2560, 3008]
        },
        {
          name: 'timeout',
          type: 'value',
          valueType: 'number',
          description:
            'The number of seconds which the AWS Lambda function running the back-end code can run for',
          required: true,
          default: 9,
          options: [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            12,
            14,
            16,
            20,
            28,
            36,
            42,
            50,
            60,
            80,
            100,
            120,
            150,
            200,
            250,
            300,
            500,
            800,
            1000,
            2000,
            3000,
            4000,
            5000,
            6000,
            7000,
            8000,
            10000,
            12000,
            15000
          ]
        }
      ]
    },
    remove: {
      description: 'Removes this instance of this component',
      inputs: []
    }
  }
}
