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
}