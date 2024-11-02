//通知类
export class Notification {
  private _title: string;
  private _source: string;
  public get title() {
    return this._title;
  }
  public get source() {
    return this._source;
  }
  public constructor(title: string, source: string) {
    this._title = title;
    this._source = source;
  }
}

export class NotificationService {
  public constructor() {}

  //向系统发送通知
  public sendNotification(item: Notification) {}

  //保存通知项目(防止用户不慎关闭程序, 当用户在通知还未过期时再次打开, 即可继续计时)
  public saveNotification() {}
}
