export interface CommonRespWrap<R> {
  code: number;
  msg: string;
  data?: R;
}
