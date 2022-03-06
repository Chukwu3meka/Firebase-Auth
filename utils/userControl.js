import cookies from "js-cookie";
import { useEffect, useState } from "react";

const useUser = () => {
  // store refresh here
  const [myRefresh, setMyRefresh] = useState("");

  const destroyCookie = () => {
    // delete cookie
    cookies.remove("FirebaseAuth", { path: "" });
    // if (document.cookie) document.cookie = "FirebaseAuth" + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  };

  // users should login after six months
  const saveCookie = (refreshToken) => cookies.set("FirebaseAuth", refreshToken, { expires: 18, path: "" });

  useEffect(() => {
    const cookie = cookies.get("FirebaseAuth");
    if (cookie) setMyRefresh(cookie);
  }, []);

  return { myRefresh, destroyCookie, saveCookie };
};

export default useUser;
