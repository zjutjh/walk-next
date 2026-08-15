import type { ActionSheetAction } from "vant";

/** 字段拓展的MediaDeviceInfo，包含首个视频轨道的MediaTrackSettings */
export interface ExtendedCameraInfo extends Omit<MediaDeviceInfo, "toJSON"> {
  /** 摄像头首个视频轨道的参数 */
  settings: MediaTrackSettings;
}

/** 摄像头选择弹层的选项 */
export interface CameraPickerAction extends ActionSheetAction {
  deviceInfo: ExtendedCameraInfo;
}
