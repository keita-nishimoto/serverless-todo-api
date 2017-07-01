/**
 * 500 Internal Server Error
 * 予期せぬエラーが起こった際に利用する。
 *
 * @author keita-nishimoto
 * @since 2017-07-02
 */
export default class InternalServerError extends Error {
  /**
   * constructor
   *
   * @param message
   */
  constructor(message: string = "Internal Server Error") {
    super(message);
    this.name = "InternalServerError";
  }
}
