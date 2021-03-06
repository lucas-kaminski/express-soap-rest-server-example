const soap = require('soap')
const express = require('express')
const fs = require('fs')

const app = express()
const SERVER_PORT = process.env.PORT || 3000;

const userRoutes = require('./api/user.routes')
const USER_WSDL = fs.readFileSync('src/static/wsdl/user.wsdl', 'utf8');
const ADDRESS_WSDL = fs.readFileSync('src/static/wsdl/address.wsdl', 'utf8');

const { CreateUser, DeleteUser, ReadUser, UpdateUser } = require('./services/UserCrudOperations')
const { GetAddressByCEP } = require('./services/AddressOperations')

const userServicesSoapObject = {
  UserService: {
    UserServiceSoapPort: { CreateUser, DeleteUser, ReadUser, UpdateUser }
  }
}

const addressServiceSoapObject = {
  GetAddressByCEPService: {
    GetAddressByCEPServiceSoapPort: { GetAddressByCEP }
  }
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

app.use((req, _, next) => {
  console.log(`[${req.method}] - ${req.url}`)
  next()
})

app.use(express.json())

app.use('/SOAP/static', express.static('src/static'))

app.get('/ping', (_, res) => {
  return res.status(200).json({ result: 'PONG' })
})

app.use('/REST/user', userRoutes)

app.listen(SERVER_PORT, () => {
  soap.listen(app, '/SOAP/user', userServicesSoapObject, USER_WSDL)
  soap.listen(app, '/SOAP/address', addressServiceSoapObject, ADDRESS_WSDL)
  console.log(`Server listening on port ${SERVER_PORT}`)
  console.log(`Check http://localhost:${SERVER_PORT}/SOAP/user?wsdl or http://localhost:${SERVER_PORT}/SOAP/address?wsdl to see if the service is working`)
})