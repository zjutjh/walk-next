export interface CommonRespWrap<R> {
  code: number;
  message: string;
  data?: R;
}
