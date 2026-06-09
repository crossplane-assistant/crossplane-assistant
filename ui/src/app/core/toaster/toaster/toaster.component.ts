import { Component, OnInit } from '@angular/core';
import { Toast, ToasterService } from '../toaster.service';
import {JsonPipe, NgClass} from "@angular/common";

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [
    JsonPipe,
    NgClass
  ],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.scss'
})
export class ToasterComponent implements OnInit{

  protected toasts: Toast[] = []

  constructor( private toastService: ToasterService){}

  ngOnInit(): void {
    this.toastService.eventBus$.subscribe(toast => {
      this.toasts.push(toast)
    })
  }

  close(toast: Toast){
    this.toasts = this.toasts.filter(t => t.id !== toast.id)
  }
}
