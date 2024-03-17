import { AppComponent } from "../app.component";

export class RowImage{
    //#region Attributes
  
    static X: string[] = ["left", "xcenter", "right"];
    static Y: string[] = ["top", "ycenter", "bottom"];
  
    public get dom(): Element | null{
      const SELECTOR: string = ".row > .image[width='" + this.width + "'][image-id='" + this.id + "']";
      return document.querySelector(SELECTOR);
    }

    private _meta?: HTMLImageElement;

    public get naturalWidth(): number {
      return this._meta ? this._meta.naturalWidth : 0;
    }

    public get naturalHeight(): number {
      return this._meta ? this._meta.naturalHeight : 0;
    }

    public get vertical(): boolean {
      return this.naturalHeight > this.naturalWidth;
    }
  
    //#endregion
  
    constructor(
      public id: number,
      public rowIndex: number,
      public left: number = 0,
      public width: number = 1,
      public x: string = RowImage.X[AppComponent.random(0, RowImage.X.length - 1)],
      public y: string = RowImage.Y[AppComponent.random(0, RowImage.Y.length - 1)],
      public animated: boolean = true, //AppComponent.random(0, 10) == 1
    ){
      const img = new Image();
      img.onload = () => { this._meta = img; };
      img.src = '/assets/images/pictures/' + this.id + '.jpg';
    }
  }