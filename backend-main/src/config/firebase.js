const admin = require("firebase-admin");
const serviceAccount = require('../../knecthotel-firebase-adminsdk-fbsvc-e316dc5d52.json'); // keep this outside `src` ideally

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
