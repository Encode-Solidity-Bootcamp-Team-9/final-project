import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationData } from '../models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifySubject = new Subject<NotificationData>();
  public notify$ = this.notifySubject.asObservable();

  constructor() {}

  public notify(data: NotificationData) {
    this.notifySubject.next(data);
  }
}
