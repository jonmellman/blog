/* eslint-disable quotes */
const connectToDatabase = async () => {
  console.log('connecting...');
};
const getRecord = async (message: any) => { };

/* class DbClient {
  public isConnected: boolean;

  constructor() {
    this.isConnected = false;
  }

  public async connect() {
    if (this.isConnected) {
      return;
    }

    await connectToDatabase();
    this.isConnected = true;
  }

  public async getRecord(recordId: string) {
    if (!this.isConnected) {
      throw new Error(`DbClient can't get records before it's connected!`);
    }

    await getRecord(recordId);
  }
}


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
      this.connectionPromise = connectToDatabase();
    }

    return this.connectionPromise;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    return getRecord(recordId);
  }
}


(async () => {
  const db = new DbClient();
  await Promise.all([
    db.getRecord('record1'),
    db.getRecord('record2'),
  ]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const myPromise = sleep(5000);

  console.time('first await');
  await myPromise;
  console.timeEnd('first await');

  console.time('second await');
  await myPromise;
  console.timeEnd('second await');
})();
