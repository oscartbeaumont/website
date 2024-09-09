/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "web": {
      "type": "sst.aws.StaticSite"
      "url": string
    }
  }
}
export {}
