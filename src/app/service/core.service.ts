import { Injectable } from '@angular/core';



@Injectable()
export class CoreService {

    images: number[] = [];
    totalImages: number = 58;

    constructor() {
        for (let i = 1; i < this.totalImages; i++) {
            this.images.push(i);
        }
    }

    changeBackgroundImageTo(idImage: number) {
        document.body.style.background = "url('../../assets/img/background/" + idImage + ".jpg') no-repeat center fixed";
        document.body.style.backgroundSize = "cover";
    }

    changeBackgroundImageToRandomImages() {
        const r = this.images[Math.floor(Math.random() * this.images.length)];
        document.body.style.background = "url('../../assets/img/background/" + r + ".jpg') no-repeat center fixed";
        document.body.style.backgroundSize = "cover";
    }
}
