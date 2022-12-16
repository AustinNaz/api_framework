import { credential, initializeApp } from 'firebase-admin'
const serviceAccount = require('../firebaseJSONCredFile')

const firebase = initializeApp({
  credential: credential.cert(serviceAccount)
})

export default firebase