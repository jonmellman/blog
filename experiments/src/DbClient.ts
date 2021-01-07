/* eslint-disable quotes */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const connectToDatabase = async () => {
  console.log('connecting...');
  await sleep(1000);
  throw new Error('boom!');
};
const getRecord = async (message: any) => { };

/*


class DbClient {
  private isConnected: boolean;

  constructor() {
    this.isConnected = false;
  }

  private async connect() {
    if (this.isConnected) {
      return;
    }

    await connectToDatabase();
    this.isConnected = true;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    await getRecord(recordId);
  }
} */

class DbClient {
  private connectionPromise: null | Promise<void>;

  constructor() {
    this.connectionPromise = null;
  }

  private async connect() {
    if (!this.connectionPromise) {
      this.connectionPromise = connectToDatabase().catch(async (e) => {
        this.connectionPromise = null;
        throw e;
      });
    }

    return this.connectionPromise;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    return getRecord(recordId);
  }
}

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e);
});

process.on('uncaughtException', (e) => {
  console.log('uncaughtException', e);
});

(async () => {
  const db = new DbClient();

  // await db.getRecord('record1');
  // return;

  const myPromise = Promise.reject(new Error('boom!'));/* .catch((e) => {
    throw new Error('from catch handler!');
  }); */

  try {
    await myPromise;
  } catch (e) {
    console.log('Caught', e);
  }

/* try {
await db.getRecord('record1');
} catch (e) {
console.log('Caught error', e);
}

try {
await db.getRecord('record2');
} catch (e) {
console.log('Caught error 2', e);
} */

  // const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  // const myPromise = sleep(5000);

  // console.time('first await');
  // await myPromise;
  // console.timeEnd('first await');

  // console.time('second await');
  // await myPromise;
  // console.timeEnd('second await');
})();
