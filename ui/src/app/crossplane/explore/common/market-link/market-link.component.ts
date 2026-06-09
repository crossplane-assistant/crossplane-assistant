import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-market-link',
  standalone: true,
  imports: [],
  templateUrl: './market-link.component.html',
  styleUrl: './market-link.component.scss'
})
export class MarketLinkComponent {


  @Input()
  public type: "functions" | "providers" | "configurations" = "providers"

  @Input()
  set image(img: string){
    this._image = img
    this.generateLink(img)
  }

  get image(): string {
    return this._image;
  }


  public _image = ""

  protected enabled : boolean= false

  protected marketUrl = ""


  // Generate the market place link from the image
  // Example :
  // from :  xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.15.0
  // to : https://marketplace.upbound.io/providers/crossplane-contrib/provider-helm/v0.19.0
  private generateLink(image: string){

    if(!image || !image.startsWith("xpkg.upbound.io/")){
      this.enabled = false
      this.marketUrl = ""
    }

    let urlPath = image.replace("xpkg.upbound.io/", "")
    urlPath = urlPath.replace(":", "/")

    this.marketUrl = `https://marketplace.upbound.io/${this.type}/${urlPath}`
    this.enabled = true
  }

}
