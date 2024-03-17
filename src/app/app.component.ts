import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RowImage } from './utils/image';
import { Row } from './utils/row';

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

  private _maxImageId: number = 18;

  private _interval?: any;
  protected target?: Element;

  private get _imagesIDs(): number[]{
    const IDs: number[] = [];

    this.rows.forEach((row: Row) => {
      row.images.forEach((image: RowImage) => {
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
        const IMAGE: RowImage = new RowImage(this.getNewPhotoRandomID(), i);
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
        const IMAGE: RowImage = this.rows[this.rows.length - 1].images[i];
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
              IMAGES[i].classList.add('animated');
              if(IMAGES.length == nbFinished){
                  SELF.clickOnPhoto();
              }
            }
          });
        }, AppComponent.random(0, 100));
      }
    });
  }

  protected clickOnPhoto(event?: MouseEvent): void{
    if(!this.target){
      if(event){
        if(event.target){
          this.target = event.target as Element;
          this.loop();
        }
      }
      clearInterval(this._interval);
      this._interval = setInterval(() => {
        this.loop();
      }, 5000);
    }
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
    const SELF = this;
    const CLASS: string = "removed";
    const ELEMENTS: Element[] = [];
    if(!this.target){
      const ROWS: Element[] = Array.from(document.querySelectorAll(".row"));
      const ROW: Element = ROWS[AppComponent.random(0, ROWS.length - 1)];
      const TARGETS: NodeListOf<Element> = ROW.querySelectorAll(".image > div:not(." + CLASS + ")");
      const INDEX = AppComponent.random(0, TARGETS.length - 1);
      ELEMENTS.push(TARGETS[INDEX]);
      // Double
      if(parseInt(ELEMENTS[0].getAttribute("width")!) == 1){
        if(AppComponent.random(1, 4) == 1){
          if(INDEX > 0 && Math.random() >= 0.5){
            if(parseInt(TARGETS[INDEX - 1].getAttribute("width")!) == 1){
              ELEMENTS.push(TARGETS[INDEX - 1]);
            }
          }
          else if(INDEX + 1 < this.maxImagesPerRow - 1){
            if(parseInt(TARGETS[INDEX + 1].getAttribute("width")!) == 1){
              ELEMENTS.push(TARGETS[INDEX + 1]);
            }
          }
          if(ELEMENTS.length == 2){
            ELEMENTS[1].className = ELEMENTS[0].className;
          }
        }
      }
    }
    else{
      ELEMENTS.push(this.target);
    }

    const FROM_THE_RIGHT: boolean = Math.random() >= 0.5;
    ELEMENTS.forEach(element => {
      element.classList.add(CLASS);
    });
    const IMAGES_IDS: number[] = ELEMENTS.map(x => parseInt(x.getAttribute("image-id")!));
    const IMAGE_WIDTH: number = ELEMENTS.map(x => parseInt(x.getAttribute("width")!)).reduce((partialSum, element) => partialSum + element, 0);

    const ROW = ELEMENTS[0].closest(".row");
    if(ROW){
      const Y: number = parseInt(ROW!.getAttribute("y")!);

      setTimeout(() => {
        const INDEXES: number[] = [];
        IMAGES_IDS.forEach(id => {
          INDEXES.push(this.rows[Y].images.map(x => x.id).indexOf(id));
        });
        const INDEX = FROM_THE_RIGHT ? Math.min(... INDEXES) : Math.max(... INDEXES);
        const FRIENDS = FROM_THE_RIGHT ? this.rows[Y].images.slice(INDEX + 1) : this.rows[Y].images.slice(0, INDEX);

        this.rows[Y].images = this.rows[Y].images.filter(x => !IMAGES_IDS.includes(x.id));
        
        const NEW_IMAGES: RowImage[] = [];
        let width: number = this.maxImagesPerRow - IMAGE_WIDTH;
        while(width < this.maxImagesPerRow){
          const NEW_IMAGE: RowImage = new RowImage(this.getNewPhotoRandomID(), Y);
          const WIDTH: number = ELEMENTS.length > 1 ? 2 : this.maxImagesPerRow - width > 1 ? AppComponent.random(1, 4) == 1 ? 2 : 1 : 1;
          NEW_IMAGE.width = WIDTH;
          width += WIDTH;

          NEW_IMAGES.push(NEW_IMAGE);
          FROM_THE_RIGHT ? this.rows[Y].images.push(NEW_IMAGE) : this.rows[Y].images.unshift(NEW_IMAGE);
        }
        for(let i = 0; i < NEW_IMAGES.length; i++){
          NEW_IMAGES[i].left = (FROM_THE_RIGHT ? (this.maxImagesPerRow * 2 + i) : (this.maxImagesPerRow - NEW_IMAGES[i].width - i));
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
                easing: AppComponent.easing,
                complete: function() {
                  if(i == DOMS.length - 1){
                    SELF.target = undefined;
                  }
                }
              });
            }, i * 50);
          }
        }

        setTimeout(() => {
          NEW_IMAGES.map(x => x.dom).forEach(element => {
            //@ts-ignore
            anime({
              targets: element,
              translateX: (document.body.clientWidth / this.maxImagesPerRow * (FROM_THE_RIGHT ? -1 : 1)) * IMAGE_WIDTH,
              easing: AppComponent.easing,
              complete: function(event: any) {
                element?.classList.add('animated');
              }
            });
          });
        }, 50 * FRIENDS.length);
        
      }, this._cssImageRemoveAnimationDuration);
    }
    else{
      this.target = undefined;
      this.loop();
    }
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
