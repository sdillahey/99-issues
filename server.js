const secret = process.env.WEBHOOK_SECRET

const http = require('http')
const webHookHandler = require('github-webhook-handler')({
  path: '/',
  secret: secret
})

const app = require('github-app')({
  id: process.env.APP_ID,
  cert: require('fs').readFileSync('.data/private-key.pem')
})

http.createServer(handleRequest).listen(3000)

webHookHandler.on('issues', (event) => {
  //ignore all issues other than new ones
  if (event.payload.action !== 'opened') return;

  const {installation, repository, issue} = event.payload
  app.asInstallation(installation.id).then((github) => {
    github.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      number: issue.number,
      body: 'Welcome to the robot uprising.'
    })
  })
})

function handleRequest (request, response) {
  // for GET (and other non-POST) requests show "ok" and stop here
  if (request.method !== 'POST') return response.end('ok')
  
  // here we pass the current request & response to the webHookHandler we created
  // on top. If the request is valid, then the "issue" above handler is called
  webHookHandler(request, response, () => response.end('ok'))
}