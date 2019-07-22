const getPolicy = (permissions) => {
  if (permissions === 'admin') {
    // user explicitly specified admin permissions
    return {
      arn: 'arn:aws:iam::aws:policy/AdministratorAccess'
    }
  } else if (permissions && permissions.length !== 'undefined') {
    // user specified their own simple permissions
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Action: permissions,
          Effect: 'Allow',
          Resource: '*'
        }
      ]
    }
  } else if (typeof permissions === 'object') {
    // user specified their own policy
    return permissions
  }

  // by default return a policy with access to only dynamodb & logs
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: ['dynamodb:*', 'logs:*'],
        Effect: 'Allow',
        Resource: '*'
      }
    ]
  }
}

module.exports = { getPolicy }
