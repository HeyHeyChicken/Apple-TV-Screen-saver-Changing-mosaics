import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

class Image{
  //#region Attributes

  static X: string[] = ["left", "xcenter", "right"];
  static Y: string[] = ["top", "ycenter", "bottom"];

  //#endregion

  constructor(
    public id: number,
    public size: number = 1,
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
      let width: number = 0;
      for(let i = 0; i < NB_IMAGES_IN_ROW; i++){
        const IMAGE: Image = new Image(this.getNewPhotoRandomID());
        this.rows[this.rows.length - 1].images.push(IMAGE);
      }
      // Set width
      let size: number = this.rows[this.rows.length - 1].images.map(x => x.size).reduce((partialSum, a) => partialSum + a, 0);
      while(size < this.maxImagesPerRow){
        const SMALL_IMAGES_IDS: number[] = this.rows[this.rows.length - 1].images.filter(x => x.size == 1).map(x => x.id);
        const ID: number = SMALL_IMAGES_IDS[AppComponent.random(0, SMALL_IMAGES_IDS.length - 1)];
        this.rows[this.rows.length - 1].images.filter(x => x.id == ID)[0].size += 1;
        size = this.rows[this.rows.length - 1].images.map(x => x.size).reduce((partialSum, a) => partialSum + a, 0);
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
            easing: function(el: any, index: number, total: number) {
              return function(time: number) {
                const BACK = 1 - (Math.abs(Math.sin((Math.pow(time, 2) - 0.2) * Math.PI * 2.5)) * ((1/(Math.pow((time + 0.1), 2)))/100));
                return BACK;
              }
            },
            complete: function(anim: any) {
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

  private loop(): void{
    setTimeout(() => {
      //console.log()
      const TARGETS = document.querySelectorAll(".row > .image > div:not(.removed)");
      TARGETS[AppComponent.random(0, TARGETS.length - 1)].classList.add("removed");

      this.loop();
    }, 5000);
  }
  
  public static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
