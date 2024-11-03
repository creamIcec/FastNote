import { Notification } from "electron";
import { NotificationItem } from "../io/notification-service.js";

export function nativeSendNotification(item: NotificationItem) {
  const notification = new Notification({
    title: item.content,
    body: item.title,
  });
  notification.show();
}
