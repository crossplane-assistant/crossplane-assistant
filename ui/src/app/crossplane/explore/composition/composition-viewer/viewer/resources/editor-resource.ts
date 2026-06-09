import { Type } from '@angular/core';

export interface ResourceViewerProvider {
  isSupported(group: string, kind: string): boolean;

  provide(): Type<any>;
}
