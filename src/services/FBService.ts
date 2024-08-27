import { Database, getDatabase } from "firebase/database";
import { FBConfig } from "../config/config";

export class FBService {
  database: Database;
  constructor() {
    this.database = getDatabase(FBConfig);
  }
  // GetData<T>(path: string): Promise<T> {
  //   return new Promise((resolve, reject) => {
  //     const dbRef = ref(this.database, path);
  //     onValue(
  //       dbRef,
  //       (snapshot) => {
  //         const data = snapshot.val();
  //         resolve(data as T);
  //       },
  //       (error) => {
  //         reject(error);
  //       },
  //       { onlyOnce: false }
  //     );
  //   });
  // }

  // async AddData(path: string, data: any) {
  //   return await new Promise((resolve, reject) => {
  //     set(ref(this.database, path), { ...data })
  //       .then(() => {
  //         resolve(true);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  // }

  // UpdateData(data: any) {
  //   return new Promise((resolve, reject) => {
  //     update(ref(this.database), data)
  //       .then(() => {
  //         resolve(true);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  // }
}
