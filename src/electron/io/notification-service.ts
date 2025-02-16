import { nativeSendNotification } from "../native/notification.js";

import GetLogger from "../logger.js";
const logger = GetLogger(import.meta.url);

//通知类
export class NotificationItem {
  private _title: string;
  private _content: string;
  private _delay: number;
  public get title() {
    return this._title;
  }
  public get content() {
    return this._content;
  }
  public get delay() {
    return this._delay;
  }
  public constructor(title: string, source: string, delay: number) {
    this._title = title;
    this._content = source;
    this._delay = delay;
  }
}

export class NotificationService {
  private notificationQueue: NotificationItem[];

  public constructor() {
    this.notificationQueue = [];
  }

  //加入通知队列
  public enqueue(item: NotificationItem) {
    //如果不存在才加入
    if (
      !this.notificationQueue.find((i) => {
        i.title === item.title;
      })
    ) {
      this.notificationQueue.push(item);
      setTimeout(() => {
        nativeSendNotification(item);
        this.notificationQueue = this.notificationQueue.filter(
          (i) => i.title !== item.title
        );
      }, item.delay);
      logger.info("通知设置成功");
    } else {
      throw new Error("Cannot create duplicated notifications.");
    }
  }

  //序列化, 保存通知项目(防止用户不慎关闭程序, 当用户在通知还未过期时再次打开, 即可继续计时)
  public serialize() {
    //TODO
  }

  //反序列化, 加载之前关闭时剩余的通知项目
  public deserialize() {
    //TODO
  }
}
