class DbClient {
  private connectionPromise: Promise<void> | null;

  constructor() {
    this.connectionPromise = null;
  }

  private async connect() {
    if (!this.connectionPromise) {
      this.connectionPromise = connectToDatabase(); // stub
    }

    return this.connectionPromise;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    return getRecordFromDatabase(recordId); // stub
  }
}
