import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

class Image{
  //#region Attributes

  static X: string[] = ["left", "xcenter", "right"];
  static Y: string[] = ["top", "ycenter", "bottom"];

  public get dom(): Element | null{
    const SELECTOR: string = ".row > .image[width='" + this.width + "'][image-id='" + this.id + "']";
    return document.querySelector(SELECTOR);
  }

  //#endregion

  constructor(
    public id: number,
    public rowIndex: number,
    public left: number = 0,
    public width: number = 1,
    public x: string = Image.X[AppComponent.random(0, Image.X.length - 1)],
    public y: string = Image.Y[AppComponent.random(0, Image.Y.length - 1)]
  ){}
}

class Row{
  constructor(public images: Image[]){}
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  //#region Attributes

  protected maxImagesPerRow: number = 5;

  protected nbRows: number = 2;

  protected rows: Row[] = [];

  private _cssImageRemoveAnimationDuration: number = 400;

  private _maxImageId: number = 14;

  private get _imagesIDs(): number[]{
    const IDs: number[] = [];

    this.rows.forEach((row: Row) => {
      row.images.forEach((image: Image) => {
        IDs.push(image.id);
      });
    });
    
    return IDs;
  }

  //#endregion

  constructor(){
    for(let i = 0; i < this.nbRows; i++){
      this.rows.push(new Row([]));

      const NB_IMAGES_IN_ROW: number = AppComponent.random(1, 4) == 1 ? 4 : 5;
      for(let i = 0; i < NB_IMAGES_IN_ROW; i++){
        const IMAGE: Image = new Image(this.getNewPhotoRandomID(), i);
        this.rows[this.rows.length - 1].images.push(IMAGE);
      }
      // Set width
      let size: number = this.rows[this.rows.length - 1].images.map(x => x.width).reduce((partialSum, a) => partialSum + a, 0);
      while(size < this.maxImagesPerRow){
        const SMALL_IMAGES_IDS: number[] = this.rows[this.rows.length - 1].images.filter(x => x.width == 1).map(x => x.id);
        const ID: number = SMALL_IMAGES_IDS[AppComponent.random(0, SMALL_IMAGES_IDS.length - 1)];
        this.rows[this.rows.length - 1].images.filter(x => x.id == ID)[0].width += 1;
        size = this.rows[this.rows.length - 1].images.map(x => x.width).reduce((partialSum, a) => partialSum + a, 0);
      }
      // Set left
      let left: number = 0;
      for(let i = 0; i < this.rows[this.rows.length - 1].images.length; i++){
        const IMAGE: Image = this.rows[this.rows.length - 1].images[i];
        IMAGE.left = left;
        left += IMAGE.width;
      }
    }
  }

  //#region Functions

  ngOnInit(): void {
    const SELF = this;
    setTimeout(() => {
      const IMAGES: NodeListOf<Element> = document.querySelectorAll(".row > .image");
      let nbFinished: number = 0;
      for(let i = 0; i < IMAGES.length; i++){
        setTimeout(() => {
          //@ts-ignore
          anime({
            targets: IMAGES[i],
            translateX: document.body.clientWidth,
            easing: AppComponent.easing,
            complete: function() {
              nbFinished++;
              if(IMAGES.length == nbFinished){
                SELF.loop();
              }
            }
          });
        }, AppComponent.random(0, 100));
      }
    });
  }
  
  public static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public static easing(el: any, index: number, total: number) {
    return function(time: number) {
      const BACK = 1 - (Math.abs(Math.sin((Math.pow(time, 2) - 0.2) * Math.PI * 2.5)) * ((1/(Math.pow((time + 0.1), 2)))/100));
      return BACK;
    }
  }
  
  public leftToPx(left: number): number {
    return document.body.clientWidth / this.maxImagesPerRow * left;
  }

  private loop(): void{
    setTimeout(() => {
      const TARGETS = document.querySelectorAll(".row > .image > div:not(.removed)");

      const TARGET = TARGETS[AppComponent.random(0, TARGETS.length - 1)];
      TARGET.classList.add("removed");
      const IMAGE_ID: number = parseInt(TARGET.getAttribute("image-id")!);
      const IMAGE_WIDTH: number = parseInt(TARGET.getAttribute("width")!);

      const ROW = TARGET.closest(".row");
      const Y: number = parseInt(ROW!.getAttribute("y")!);

      setTimeout(() => {
        const FROM_THE_RIGHT: boolean = Math.random() >= 0.5;
        const INDEX = this.rows[Y].images.map(x => x.id).indexOf(IMAGE_ID);
        const FRIENDS = FROM_THE_RIGHT ? this.rows[Y].images.slice(INDEX + 1) : this.rows[Y].images.slice(0, INDEX);

        this.rows[Y].images = this.rows[Y].images.filter(x => x.id != IMAGE_ID);
        
        const NEW_IMAGES: Image[] = [];
        for(let i = 0; i < IMAGE_WIDTH; i++){
          const NEW_IMAGE: Image = new Image(this.getNewPhotoRandomID(), Y);
          NEW_IMAGE.left = FROM_THE_RIGHT ? (this.maxImagesPerRow * 2 + i) : (this.maxImagesPerRow - 1 - i);
          NEW_IMAGES.push(NEW_IMAGE);
          FROM_THE_RIGHT ? this.rows[Y].images.push(NEW_IMAGE) : this.rows[Y].images.unshift(NEW_IMAGE);
        }


        const DOMS = FRIENDS.map(x => x.dom);
        for(let i = 0; i < DOMS.length; i++){
          if(DOMS[i]){
            setTimeout(() => {
              const STYLE = window.getComputedStyle(DOMS[i]!);
              const MATRIX = new WebKitCSSMatrix(STYLE.transform);
              const OLD_TRANSLATE_X: number = MATRIX.m41;
              //@ts-ignore
              anime({
                targets: DOMS[i],
                translateX: OLD_TRANSLATE_X + (document.body.clientWidth / this.maxImagesPerRow * (FROM_THE_RIGHT ? -1 : 1)) * IMAGE_WIDTH,
                easing: AppComponent.easing
              });
            }, i * 50);
          }
        }

        setTimeout(() => {
          //@ts-ignore
          anime({
            targets: NEW_IMAGES.map(x => x.dom),
            translateX: (document.body.clientWidth / this.maxImagesPerRow * (FROM_THE_RIGHT ? -1 : 1)) * IMAGE_WIDTH,
            easing: AppComponent.easing
          });
        }, 50 * FRIENDS.length);
        
      }, this._cssImageRemoveAnimationDuration);

      this.loop();
    }, 5000);
  }

  private getNewPhotoRandomID(): number {
    const ALREADY_USED_IDS: number[] = this._imagesIDs;
    const AVAILLABLE_IDS: number[] = [];
    for(let i = 1; i <= this._maxImageId; i++){
      if(!ALREADY_USED_IDS.includes(i)){
        AVAILLABLE_IDS.push(i);
      }
    }
    return AVAILLABLE_IDS[AppComponent.random(0, AVAILLABLE_IDS.length - 1)];
  }

  //#endregion
}
