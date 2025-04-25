import { FileAccessTypeEnum } from '~/@types';

export class GlobalFileAccessType {
  #fileAccessType: Amity.FileAccessType = FileAccessTypeEnum.PUBLIC;

  public setFileAccessType(fileAccessType: Amity.FileAccessType) {
    this.#fileAccessType = fileAccessType;
  }

  public getFileAccessType() {
    return this.#fileAccessType;
  }
}

let instance: GlobalFileAccessType;
export default {
  getInstance: () => {
    if (!instance) {
      instance = new GlobalFileAccessType();
    }
    return instance;
  },
};
