exports.myFunction = functions.firestore
  .document("chat/{messageId}")
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const senderId = messageData["userId"];
    console.log(`Sender ID: ${senderId}`);

    // Get all users from Firestore
    const usersSnapshot = await admin.firestore().collection("users").get();

    // Filter out the sender and get the tokens of all other users
    const tokens = usersSnapshot.docs
      .filter((doc) => {
        console.log(`Doc ID: ${doc.id}`);
        return doc.id !== senderId;
      })
      .map((doc) => doc.data().token);

    console.log(`Tokens: ${tokens}`);

    // Send a notification to each token
    return admin.messaging().sendToDevice(tokens, {
      notification: {
        title: messageData["username"],
        body: messageData["text"],
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
      data: {
        senderId: senderId,
      },
    });
  });
