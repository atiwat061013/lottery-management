import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'negativNumber'
})
export class NegativNumberPipe implements PipeTransform {

  transform(value: number): boolean {
    if(value >= 1){
      return false;
    }else {
      return true;
    }
  }

}
