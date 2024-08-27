import { initializeApp } from "firebase/app";
import { GetENV } from "../utils/GetEnv";
import { getDatabase,ref } from "firebase/database";
const firebaseConfig = {
  apiKey: GetENV("FBASE_API_KEY"),
  authDomain: GetENV("FBASE_AUTH_DOMAIN"),
  databaseURL: GetENV("FBASE_DATABASE_URL"),
  projectId: GetENV("FBASE_PROJECT_ID"),
  storageBucket: GetENV("FBASE_STORAGEBUCKET"),
  messagingSenderId: GetENV("FBASE_MESSAGGINGSENDERID"),
  appId: GetENV("FBASE_APPID"),
  measurementId: GetENV("FBASE_MESUREMENTID"),
};

const FBConfig = initializeApp(firebaseConfig);
const dbRef = ref(getDatabase());
export { dbRef, FBConfig };
