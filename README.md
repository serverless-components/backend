# Backend

&nbsp;

Easily host entire web applications on a single AWS Lambda function using this [Serverless Component](https://www.github.com/serverless/components).

### Features

* Designed to make it easy to host pre-existing web frameworks (e.g. Express.js, Hapi) or any large web application on a single AWS Lambda Function.
* Blazing Fast Uploads via AWS S3 Accelerated Transfer and Multi-Part.
* Dependencies are automatically put in AWS Lambda Layers, reducing cold-start time and further reducing upload time.
* Simple shim for receiving and responding to HTTP requests.
* Supports specifying custom domains.

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;


### 1. Install

```console
$ npm install -g serverless
```

### 2. Create

```console
$ mkdir backend && cd backend
```

The directory should look something like this:


```
|- serverless.yml # required
|- index.js       # required
|- package.json   # optional
|- .env           # your AWS api keys
```

```
# .env
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

You must include an `index.js` file that looks like this:

```js
module.exports = async (e, ctx, cb) => {
  return { statusCode: 200, body: 'backend app deployed.' }
}

// you could also just return an object
// which would return it as body with
// 200 status code by default
// module.exports = () => ({ hello: 'world' })

// or just a string
// module.exports = () => 'success'

// or a status code number
// module.exports = () => 404 // not found!

// you don't even need to export a function!
// module.exports = { hello: 'world' } // great for mocking!
// module.exports = 'success'
// module.exports = 500
```

### 3. Configure

All the following inputs are optional. However, they allow you to configure your Lambda compute instance and pass environment variables.

```yml
# serverless.yml

backend:
  component: "@serverless/backend"
  inputs:
    code:
      root: ./code # The root folder containing the backend code.
      src: dist # The folder within your 'src' directory containing your built artifacts
      hook: npm run build # A hook to build/test/do anything
    region: us-east-1
    memory: 128
    timeout: 10
    env:
      TABLE_NAME: my-table
    
    # You can specify a custom domain name for your backend.
    # You must have a public hosted zone available for this domain in AWS Route53.
    # This is done automatically for you if you've purchased the domain via AWS Route53.
    domain: api.example.com
```

### 4. Deploy

```console
$ serverless
```

All requests to this root url will be proxied directly to your lambda function, giving you full control of the http layer.

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
