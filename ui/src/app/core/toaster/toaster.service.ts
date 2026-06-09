import { EventEmitter, Injectable } from '@angular/core';
import * as uuid from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor() { }

  public eventBus$: EventEmitter<Toast> = new EventEmitter<Toast>();

  alert(t: Toast){
    this.eventBus$.emit(t)
  }
}

export class Toast{

  constructor(msg: string, title: string = ""){
    this.id = uuid.v4()
    this.date = new Date()
    this.msg = msg
    this.title = title
  }

  type: "error" | "info" = "error"
  id: string | undefined
  date: Date | undefined
  title: string = ""
  msg: string = ""
}
