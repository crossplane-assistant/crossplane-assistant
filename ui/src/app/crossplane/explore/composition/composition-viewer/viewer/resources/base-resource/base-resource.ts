import { ResourceContext } from '../dynamic-resource-viewer/dynamic-resource-viewer.component';
import { EditorHandler } from './editor-handler';

export class BaseResourceComponent {
  public editorHandler = new EditorHandler();

  _resourceContext: ResourceContext | undefined;

  protected set resourceContext(resourceContext: ResourceContext | undefined) {
    this._resourceContext = resourceContext;
    if (resourceContext) {
      this.onResourceContextChange(resourceContext);
    }
  }

  protected get resourceContext(): ResourceContext | undefined {
    return this._resourceContext;
  }

  protected onResourceContextChange(resourceContext: ResourceContext) {}

  activeTab: string = '';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
