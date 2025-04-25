import GlobalFileAccessType from '~/client/utils/GlobalFileAccessType';

export function setUploadedFileAccessType(accessType: Amity.FileAccessType) {
  GlobalFileAccessType.getInstance().setFileAccessType(accessType);
}
