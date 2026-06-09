export class EditorHandler {
  editorSize: number = 400;
  editorMaxSize: number = 1500;
  editorLineHeight: number = 17;
  enableScroll: boolean = false;
  _content: string = '';

  options = {
    theme: 'vs',
    language: 'yaml',
    scrollBeyondLastLine: false,
    fontSize: 12.5,
    automaticLayout: true,
    readOnly: true,
    scrollbar: {
      //vertical: 'hidden',
      alwaysConsumeMouseWheel: this.enableScroll,
    },
  };

  set content(content: string) {
    // Compute the editor size to fit the content
    let nbLineContent = content.split('\n').length;
    this.editorSize =
      nbLineContent * this.editorLineHeight + this.editorLineHeight * 1.5;

    // Enable scroll only if size content size it greater that max allowed size
    if (this.editorSize > this.editorMaxSize) {
      this.enableScroll = true;
      this.editorMaxSize = 1500;
    } else {
      this.enableScroll = false;
    }
    this._content = content;
  }

  get content(): any {
    return this._content;
  }

  get style(): string {
    return `height: ${this.editorSize}px;`;
  }
}
