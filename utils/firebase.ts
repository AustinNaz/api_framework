import { credential, initializeApp } from 'firebase-admin'
const serviceAccount = require('../firebase-adminSDK.json')

const firebase = initializeApp({
  credential: credential.cert(serviceAccount)
})

export default firebase