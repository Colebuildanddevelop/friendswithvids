const functions = require('firebase-functions');

const admin = require("firebase-admin");



admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://friendswithvids.firebaseio.com"
});

let db = admin.firestore();

exports.updateActiveVisitors = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    // iterate the user collection and update appropriately  
    let currentTime = admin.firestore.Timestamp.now().seconds;
    let thirtyMinutesAgo = currentTime - 1800; 
    db.collection('visitors').where('timestamp', '<', thirtyMinutesAgo).get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('no inactive users')
          return null;
        }  
        snapshot.forEach(doc => {
          doc.ref.delete();
        })
        console.log(thirtyMinutesAgo)
        return null;
      })
      .catch(err => {
        console.log(err)
        return null;
      });
  }); 

  exports.updateActiveUsers = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    // iterate the user collection and update appropriately  
    let currentTime = admin.firestore.Timestamp.now().seconds;
    let thirtyMinutesAgo = currentTime - 1800; 
    db.collection('users').where('lastSeen', '<', thirtyMinutesAgo).get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('no inactive users')
          return null;
        }  
        snapshot.forEach(doc => {
          doc.ref.update({
            isActive: false
          });
        })
        console.log(thirtyMinutesAgo)
        return null;
      })
      .catch(err => {
        console.log(err)
        return null;
      });
  }); 