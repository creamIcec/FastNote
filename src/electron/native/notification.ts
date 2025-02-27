import { Notification } from "electron";
import { NotificationItem } from "../io/notification-service.js";
import GetLogger from "../logger.js";
const logger = GetLogger(import.meta.url);

export function nativeSendNotification(item: NotificationItem) {
  const notification = new Notification({
    title: item.content,
    body: item.title,
  });
  if (item.clickCallback) {
    notification.on("click", (e) => {
      logger.info("User clicked the notification popup");
      item.clickCallback!(e);
      notification.close();
    });
  }
  notification.show();
}
