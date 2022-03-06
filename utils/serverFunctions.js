function checkInternet(cb) {
  require("dns").lookup("google.com", function (err) {
    if (err && err.code == "ENOTFOUND") {
      cb(false);
    } else {
      cb(true);
    }
  });
}

export const verifyToken = async (refresh) => {
  const { access_token: token } = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${JSON.parse(process.env.NEXT_PUBLIC_CLIENT).apiKey}`,
    {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/x-www-form-urlencoded" }),
      body: `grant_type=refresh_token&refresh_token=${refresh}`,
      credentials: "same-origin",
    }
  ).then((res) => res.json());

  return token;
};

export const profileFromRefresh = async ({ refresh, cookie, optional }) => {
  const { auth, firestore } = await require("@utils/firebaseServer");

  if (!refresh) {
    if (!cookie) {
      if (optional) return null;
      throw 1001;
    }
    const notConnected = checkInternet((isNotConnected) => (isNotConnected ? true : false));
    if (notConnected) throw 1000;

    let cookieRefresh;
    await cookie?.split("; ").forEach((x) => {
      if (x.split("=")[0] === "ViewCrunch") cookieRefresh = x.split("=")[1];
    });

    if (!cookieRefresh) throw 1002;
    refresh = cookieRefresh;
  }

  if (!refresh) throw 1003;

  const token = await verifyToken(refresh);
  if (!token) throw 1004;

  const uid = await auth
    .verifyIdToken(token)
    .then(({ uid }) => uid)
    .catch((err) => {
      throw 1005;
    });
  if (!uid) throw 1005;

  const profile = await firestore
    .collection("profile")
    .doc(uid)
    .get()
    .then((snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        ...data,
        unseenNotification: Object.values(data.notification).reduce((unread, { seen }) => unread + (seen ? 0 : 1), 0),
        // notification: {
        //   messages: notification,
        // },
      };
    })
    .catch((error) => {
      throw error;
    });

  if (!profile) throw 1006;
  return profile;
};
